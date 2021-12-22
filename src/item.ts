import axios from "axios";

import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import evaluate = require("./evaluate-item");
import evaluateNeutral = require("./evaluate-neutral-item");
import { sleep } from "./utils";
import { login, server, updateItem } from "./uploader";


async function main() {
    const IS_PROD = process.env.ENV === 'prod';
    try {
        const browser = await puppeteer.launch({
            devtools: !IS_PROD,
            defaultViewport: null
        });
        const pages = await browser.pages();
        await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2l0ZW1zL2luZGV4Lmh0bQ==', 'base64').toString('utf-8') + '?#tab1', { timeout: 120 * 1000 });
        await sleep(1000);
        const items: any = await pages[0].evaluate(evaluate)

        await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2l0ZW1zL2luZGV4Lmh0bQ==', 'base64').toString('utf-8') + '?#tab2');
        await sleep(1000);
        const neutralItems: any = await pages[0].evaluate(evaluateNeutral)

        items.push(...neutralItems);
        if (items.length < 200) {
            throw new Error(`爬取物品数目过少! ${items.length}`)
        }
        const res: any = await axios.get(`${server}/node/dota/items`);
        const itemsOnServer: Array<any> = res.data.payload;
        if (itemsOnServer.length < 200) {
            throw new Error(`服务器物品数目过少! ${itemsOnServer.length}`)
        }
        if (IS_PROD) await login();
        for (let item of items) {
            let itemOnServer = itemsOnServer.find(itemOnServer => item.key === itemOnServer._id);
            if (!itemOnServer) {
                console.log(`发现新的物品：${item.name}\n`);
                if (IS_PROD) await updateItem(item);
            } else {
                console.log(`比对物品：${item.name}\n`);
                const detailRes: any = await axios.get(`${server}/node/dota/items/${item.key}`);
                itemOnServer = detailRes.data.payload;
                if (!itemOnServer) {
                    throw new Error(`未找到 ${item.name} !\n`);
                } else {
                    let needUpdate = false;
                    for (let key of Object.keys(itemOnServer)) {
                        if (item[key] && JSON.stringify(item[key]) !== JSON.stringify(itemOnServer[key])) {
                            console.log(`${key} 不一致！s=${JSON.stringify(itemOnServer[key])}, c=${JSON.stringify(item[key])}\n`);
                            needUpdate = true;
                            itemOnServer[key] = item[key];
                            itemOnServer.key = item.key;
                        }
                    }
                    if (needUpdate) {
                        console.log(`更新 ${item.name} \n`);
                        if (IS_PROD) await updateItem(itemOnServer);
                    } else {
                        console.log(`无需更新 ${item.name} \n`);
                    }

                }
            }
        }
        await browser.close();
    } catch (e) {
        console.error("crawler item error-->", e);
        process.exit(1);
    }
}
axios.defaults.timeout = 30000;
main();