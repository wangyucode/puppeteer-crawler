import axios from "axios";
import * as dotenv from "dotenv";
import * as readline from "readline";
import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import evaluate = require("./evaluate-item");
import evaluateNeutral = require("./evaluate-neutral-item");
import { sleep } from "./utils";
import { login, server, updateItem } from "./uploader";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    try {
        const browser = await puppeteer.launch({
            devtools: process.env.ENV === 'dev',
            defaultViewport: null
        });
        const pages = await browser.pages();
        await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2l0ZW1zL2luZGV4Lmh0bQ==', 'base64').toString('utf-8') + '?#tab1');
        await sleep(1000);
        const items: any = await pages[0].evaluate(evaluate)

        await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2l0ZW1zL2luZGV4Lmh0bQ==', 'base64').toString('utf-8') + '?#tab2');
        await sleep(1000);
        const neutralItems: any = await pages[0].evaluate(evaluateNeutral)

        items.push(...neutralItems);

        const res: any = await axios.get(`${server}/node/dota/items`);
        const itemsOnServer = res.data.payload;
        await login();
        if (itemsOnServer.length !== items.length) {
            throw new Error("物品数目不对!\n");
        }
        for (let item of items) {
            let itemOnServer = itemsOnServer.find(itemOnServer => item.key == itemOnServer._id);
            if (!itemOnServer) {
                rl.write(`发现新的物品：${item.name}\n`);
                await updateItem(item);
            } else {
                console.log(`比对物品：${item.name}\n`);
                const detailRes: any = await axios.get(`${server}/node/dota/items/${item.key}`);
                itemOnServer = detailRes.data.payload;
                if (!itemOnServer) {
                    throw new Error(`未找到 ${item.name} !\n`);
                } else {
                    let needUpdate = false;
                    for (let key of Object.keys(itemOnServer)) {
                        if (item[key] && item[key] !== itemOnServer[key]) {
                            rl.write(`${key} 不一致！\n`);
                            needUpdate = true;
                            itemOnServer[key] = item[key];
                            itemOnServer.key = item.key;
                        }
                    }
                    if (needUpdate) {
                        rl.write(`更新 ${item.name} \n`);
                        await updateItem(itemOnServer);
                    } else {
                        rl.write(`无需更新 ${item.name} \n`);
                    }

                }
            }
        }
        await browser.close();
    } catch (e) {
        console.error("crawler heros error-->", e);
        process.exit(1);
    }


    rl.close();

}

dotenv.config();
main();