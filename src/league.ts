import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import * as dotenv from "dotenv";
import { convertImageUrl, sleep } from "./utils";
import { DotaNews, DotaNewsNode } from "./types";
import { clearNews, login, uploadNews, uploadNewsDetail } from "./uploader";

async function start() {
    const url = Buffer.from('aHR0cHM6Ly93d3cudnBnYW1lLmNvbS9zY2hlZHVsZS9sZWFndWU/Z2FtZV90eXBlPWRvdGE=', "base64").toString('utf-8');
    try {
        const browser = await puppeteer.launch({
            devtools: process.env.ENV === 'dev',
            defaultViewport: null
        });
        let pages = await browser.pages();
        console.log(url);
        await pages[0].goto(url);
        const areas = await pages[0].evaluate(() => {
            return document.querySelectorAll('ul.place-nav > li').length;
        });

        for (let i = 0; i < areas; i++) {
            await pages[0].evaluate((index) => {
                // @ts-ignore
                document.querySelectorAll('ul.place-nav > li')[index].click();
            }, i);

            await sleep(2000);

            await pages[0].evaluate(() => {
                document.querySelectorAll('p.zh_CN_wait, p.zh_CN_start').forEach((league: Element) => {
                    const start = league.parentElement.querySelector('div.star').childNodes.length;
                    if (start > 3) league.parentElement.click();
                });
            });
        }

        await pages[0].close();

        pages = await browser.pages();

        console.log("size-->", pages.length);

        await browser.close();
    } catch (e) {
        console.error("crawler news error-->", e);
        process.exit(1);
    }
}

dotenv.config();
start();
