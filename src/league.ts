import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import { sleep } from "./utils";
import { login, uploadLeagues } from "./uploader";

async function start() {
    const url = Buffer.from('aHR0cHM6Ly93d3cudnBnYW1lLmNvbS9zY2hlZHVsZS9sZWFndWU/Z2FtZV90eXBlPWRvdGEmbGFuZz16aF9DTg==', "base64").toString('utf-8');
    const leagues = [];
    try {
        const browser = await puppeteer.launch({
            devtools: process.env.ENV === 'dev',
            defaultViewport: null
        });
        let pages = await browser.pages();
        console.log(url);
        await pages[0].goto(url, { timeout: 120 * 1000 });
        console.log(await pages[0].evaluate(() => document.body.lang));
        const areas = await pages[0].evaluate(() => {
            return document.querySelectorAll('ul.place-nav > li').length;
        });

        console.log('areas--->', areas);

        const nameStar = new Map();
        for (let i = 0; i < areas; i++) {
            await pages[0].evaluate((index) => {
                // @ts-ignore
                document.querySelectorAll('ul.place-nav > li')[index].click();
            }, i);

            await sleep(2000);

            const areaLeagues = await pages[0].evaluate(() => {
                const areaLeagues = [];
                document.querySelectorAll('p.zh_CN_wait').forEach((league) => {
                    const name = league.parentElement.querySelector('div.league-abbr').textContent
                    const star = league.parentElement.querySelector('div.star').childNodes.length;
                    if (star > 3) {
                        areaLeagues.push({ name, star, status: 'wait' });
                        league.parentElement.click();
                    }
                });

                document.querySelectorAll('p.zh_CN_start').forEach((league) => {
                    const name = league.parentElement.querySelector('div.league-abbr').textContent
                    const star = league.parentElement.querySelector('div.star').childNodes.length;
                    areaLeagues.push({ name, star, status: 'start' });
                    league.parentElement.click();
                });
                return areaLeagues;
            });
            console.log('areaLeagues--->', i, JSON.stringify(areaLeagues, null, 2))
            for (const v of areaLeagues) {
                nameStar.set(v.name, v);
            }
        }

        await pages[0].close();

        console.log("nameStar-->", nameStar.size);

        pages = await browser.pages();

        for (const p of pages) {
            const league: any = await p.evaluate(() => {
                try {
                    // @ts-ignore
                    const img = document.querySelector('div.info-logo > img').src;
                    const title = document.querySelector('span.abbr').textContent;
                    const date = document.querySelector('div.info-text-date').textContent.substring(title.length).trim().split('至');
                    let start = new Date(date[0]);
                    // @ts-ignore
                    start = `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}`
                    let end = new Date(date[1]);
                    // @ts-ignore
                    end = `${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}`
                    const location = document.querySelector('span.b2 > i').textContent;
                    const organizer = document.querySelector('span.b3 > i').textContent;
                    const prize = document.querySelector('span.b5 > i').textContent;

                    return { img, title, start, end, location, organizer, prize };
                } catch (error) {
                    return null;
                }

            });
            if(!league) continue;
            console.log("getting-->", league.title);
            league.star = nameStar.get(league.title).star;
            league.status = nameStar.get(league.title).status;
            leagues.push(league);
        }

        console.log("size-->", leagues.length);
        console.log("leagues-->", JSON.stringify(leagues, null, 2));

        if (!leagues.length) throw new Error('length = 0!');
        if (process.env.ENV === 'prod') {
            await login();
            await uploadLeagues(leagues);
        }

        await browser.close();
    } catch (e) {
        console.error("crawler leagues error-->", e);
        process.exit(1);
    }
}

start();
