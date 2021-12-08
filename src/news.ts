import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import * as dotenv from "dotenv";
import { convertImageUrl, sleep } from "./utils";
import { DotaNews, DotaNewsNode } from "./types";
import { login, uploadNews } from "./uploader";

async function crawlNews() {
    const url = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL25ld3MvaW5kZXg=', "base64").toString('utf-8');
    const IS_PROD = process.env.ENV === 'prod';
    try {
        const browser = await puppeteer.launch({
            devtools: !IS_PROD,
            defaultViewport: null
        });
        const pages = await browser.pages();
        const size = IS_PROD ? 10 : 2;
        if (IS_PROD) await login();
        for (let i = 1; i <= size; i++) {
            console.log('goto->', `${url}${i}.html`);
            await pages[0].goto(`${url}${i}.html`);
            await sleep(1000);
            let pageNews: DotaNews[] = await pages[0].evaluate(() => {
                const pageNews = [];
                document.querySelectorAll('a.item').forEach((it: any) => {
                    pageNews.push({
                        _id: it.href,
                        img: it.querySelector('img').src,
                        title: it.querySelector('h2').innerText,
                        content: it.querySelector('p.content').innerText,
                        date: it.querySelector('p.date').innerText,
                    })
                });
                return pageNews;
            });

            pageNews = pageNews.filter(it => {
                const file = it._id.match(/.*\/(.+)\.html$/);
                if (file && file.length > 0) {
                    return true;
                }
                console.error("it._id-->", it._id);
                return false;
            });

            for (const it of pageNews) {
                const file = it._id.match(/.*\/(.+)\.html$/);

                it.img = convertImageUrl(it.img);

                console.log('goto->', it._id);
                await pages[0].goto(it._id);
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
                it.details = detail;
                it._id = file[1];
                console.log(it);
                if (IS_PROD) {
                    if (await uploadNews(it) !== 1) throw Error('exist');
                }
            }
        }
        await browser.close();
    } catch (e) {
        console.error("crawler news error-->", e);
        process.exit(e.message === 'exist' ? 0 : 1);
    }
}

dotenv.config();
crawlNews();
