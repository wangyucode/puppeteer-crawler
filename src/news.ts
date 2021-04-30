import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import * as dotenv from "dotenv";
import { convertImageUrl, sleep } from "./utils";
import { DotaNews, DotaNewsNode } from "./types";
import { clearNews, login, uploadNews, uploadNewsDetail } from "./uploader";

async function crawlNews() {
    let news: DotaNews[] = [];
    const url = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL25ld3MvaW5kZXg=', "base64").toString('utf-8');
    console.log(url);
    const browser = await puppeteer.launch({
        devtools: process.env.ENV === 'dev',
        defaultViewport: null
    });
    const pages = await browser.pages();
    const size = process.env.ENV === 'prod' ? 6 : 1;
    for (let i = 1; i <= size; i++) {
        await pages[0].goto(`${url}${i}.html`);
        await sleep(1000);
        const pageNews: DotaNews[] = await pages[0].evaluate(() => {
            const pageNews = [];
            document.querySelectorAll('a.item').forEach((it: any) => {
                pageNews.push({
                    href: it.href,
                    img: it.querySelector('img').src,
                    title: it.querySelector('h2').innerText,
                    content: it.querySelector('p.content').innerText,
                    date: it.querySelector('p.date').innerText,
                })
            });
            return pageNews;
        });
        news.push(...pageNews);
    }
    await login();
    await clearNews();

    for (const it of news) {
        await pages[0].goto(it.href);

        it.href = it.href.match(/.*\/(.+)\.html$/)[1];
        it.img = convertImageUrl(it.img);

        await sleep(1000);
        const detail: DotaNewsNode[] = await pages[0].evaluate(() => {
            const detail = [];
            document.querySelectorAll('div.content > p').forEach((it: Element) => {
                const node: DotaNewsNode = { type: 'p', content: '' };
                node.content = it.textContent;
                switch (it.childNodes[0] && it.childNodes[0]['tagName']) {
                    case 'B':
                        node.type = 'b';
                        break;
                    case 'BR':
                        node.type = 'br';
                        break;
                    case 'IMG':
                        node.type = 'img';
                        node.content = it.childNodes[0]['src'];
                        break;
                    default:
                        node.type = 'p';
                        break;
                }
                detail.push(node)
            });
            return detail;
        });
        detail.forEach(it => {
            if (it.type === 'img') it.content = convertImageUrl(it.content);
        });
        await uploadNewsDetail(it.href, detail);
    }
    await uploadNews(news);
    await browser.close();
}

dotenv.config();
crawlNews();
