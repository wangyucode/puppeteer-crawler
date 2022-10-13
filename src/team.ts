import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import { login, uploadTeams } from "./uploader";

async function start() {
    const url = Buffer.from('aHR0cHM6Ly9lcy51dXU5LmNvbS9kb3RhL2RwYw==', "base64").toString('utf-8');
    try {
        const browser = await puppeteer.launch({
            devtools: process.env.ENV === 'dev',
            defaultViewport: null
        });
        let pages = await browser.pages();
        console.log(url);
        await pages[0].goto(url, { timeout: 120 * 1000 });

        const teams = await pages[0].evaluate(() => {
            const teams = [];
            document.querySelectorAll('div.dpc_slide').forEach(d => {
                const rank = Number.parseInt(d.querySelector('td:nth-child(1) > span').textContent);
                // @ts-ignore
                const logo = d.querySelector('td:nth-child(2) img').src;
                const name = d.querySelector('td:nth-child(2) p').textContent;
                // @ts-ignore
                const nation = d.querySelector('td:nth-child(3) img').src;
                const point = Number.parseInt(d.querySelector('td:nth-child(4) span').textContent)

                const members = [];
                d.querySelectorAll('div.dpc_c_ul li').forEach(dm => {
                    const name = dm.querySelector('p').textContent;
                    const img = dm.querySelector('img').src;
                    const note = dm.querySelector('em').textContent.replace(/\s/g, '');
                    members.push({name, note, img});
                });

                const records = [];
                d.querySelectorAll('div.dpc_c_dl dl').forEach(dr => {
                    const name = dr.querySelector('dd:nth-child(1) p').textContent.trim();
                    // @ts-ignore
                    const img = dr.querySelector('dd:nth-child(1) img').src;
                    const rank = dr.querySelector('dd:nth-child(2)').textContent;
                    const point = Number.parseInt(dr.querySelector('dd:nth-child(3)').textContent);
                    records.push({name, rank, img, point});
                });

                teams.push({ rank, logo, name, nation, point, members, records});
            });

            return teams;
        });

        console.log('teams--->', JSON.stringify(teams, null, 2));


        if (process.env.ENV === 'prod') {
            await login();
            await uploadTeams(teams);
        }

        await browser.close();
    } catch (e) {
        console.error("crawler leagues error-->", e);
        process.exit(1);
    }
}

start();
