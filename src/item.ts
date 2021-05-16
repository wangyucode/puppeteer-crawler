import axios from "axios";
import * as readline from "readline";
import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import evaluate = require("./evaluate-item");
import evaluateNeutral = require("./evaluate-neutral-item");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let token = "";

const server = 'http://localhost:8080/web';

// const server = 'https://wycode.cn/web';

async function main() {
    const browser = await puppeteer.launch({
        devtools: true,
        defaultViewport: null
    });
    const pages = await browser.pages();
    await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2l0ZW1zL2luZGV4Lmh0bQ==', 'base64').toString('utf-8') + '?#tab1');
    await sleep(1000);
    const items: any = await pages[0].evaluate(evaluate).catch(console.log);

    await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2l0ZW1zL2luZGV4Lmh0bQ==', 'base64').toString('utf-8') + '?#tab2');
    await sleep(1000);
    const neutralItems: any = await pages[0].evaluate(evaluateNeutral).catch(console.log);

    items.push(...neutralItems);
    if (items.length !== 166 + 56) throw new Error("物品数目不对!\n");

    const res: any = await axios.get(`${server}/api/public/dota/items`).catch(console.error);
    const itemsOnServer = res.data.data;
    if (itemsOnServer.length) {
        for (let itemOnServer of itemsOnServer) {
            let item = items.find(item => item.key === itemOnServer.key);
            if (!item) {
                rl.write(`发现删除的物品：${itemOnServer.name}\n`);
                await deleteItem(itemOnServer.key);
            }
        }
        for (let item of items) {
            let itemOnServer = itemsOnServer.find(itemOnServer => item.key == itemOnServer.key);
            if (!itemOnServer) {
                rl.write(`发现新的物品：${item.name}\n`);
                await updateItem(item);
            } else {
                rl.write(`比对物品：${item.name}\n`);
                const detailRes: any = await axios.get(`${server}/api/public/dota/itemDetail`, {
                    params: {
                        itemKey: item.key
                    }
                }).catch(console.error);
                itemOnServer = detailRes.data.data;
                if (!itemOnServer) {
                    throw new Error(`未找到 ${item.name} !\n`);
                } else {
                    let needUpdate = false;
                    for (let key of Object.keys(itemOnServer)) {
                        if (item[key] && item[key] !== itemOnServer[key]) {
                            rl.write(`${key} 不一致！\n`);
                            needUpdate = true;
                            itemOnServer[key] = item[key];
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
    }

    await browser.close();
    rl.close();
}

async function deleteItem(key: string) {
    if (!token) {
        await login();
    }

    const res: any = await axios.post(`${server}/api/public/admin/dota/deleteItem`, null, {
        headers: {
            'X-Auth-Token': token
        },
        params: {
            key
        }
    }).catch(console.error);
    if (res.status === 200) {
        rl.write(`${key} 删除成功！\n`);
    } else {
        rl.write(`${key} 删除失败！\n`);
    }

}

async function login() {
    const res: any = await axios.get(`${server}/api/public/admin/user/login`, {
        params: {
            username: process.env.WYCODE_ADMIN_USERNAME,
            password: process.env.WYCODE_ADMIN_PASSWORD
        }
    }).catch(console.error);
    rl.write(JSON.stringify(res.data, null, 2));
    token = res.data.data.token;
}

async function updateItem(item: any) {
    if (!token) {
        await login();
    }

    const res: any = await axios.post(`${server}/api/public/admin/dota/item`, item, {
        headers: {
            'X-Auth-Token': token
        }
    }).catch(reason => console.error(reason));

    if (res.status === 200) {
        rl.write(`${item.name} 保存成功！\n`);
    } else {
        rl.write(`${item.name} 保存失败！\n`);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function question(question: string): Promise<string> {
    return new Promise(resolve => rl.question(question, resolve))
}

main();
