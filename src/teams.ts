import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import { sleep } from "./utils";
import { login, uploadLeagues, uploadSchedules } from "./uploader";

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
                const img = d.querySelector('img')?.src;
                const statusClass = d.querySelector('i.status')?.classList[1];
                const status = statusClass === 's_2' ? 'start' : statusClass === 's_3' ? 'end' : 'wait';
                // @ts-ignore
                teams.push({ title, img, status });
            });

            return teams;
        });

        console.log('leagues on main page--->', leagues);

        for (let i = 0; i < leagues.length; i++) {
            await pages[0].evaluate((index) => {
                // @ts-ignore
                document.querySelectorAll('div.tc_pic li a')[index].click();
            }, i);

            await sleep(2000);
        }

        const matches = await pages[0].evaluate(async (u) => {
            // @ts-ignore
            const token = document.querySelector('body > script:last-child').textContent.match(/'_token': "(\w+)"/)[1];
            // @ts-ignore
            const body = new FormData();
            body.append('_token', token);
            body.append('page', '1');
            body.append('type', '1');
            const now = new Date();
            const from = `${now.getFullYear()}-${now.getMonth() < 9 ? `0${now.getMonth() + 1}` : now.getMonth() + 1}-${now.getDate() < 10 ? `0${now.getDate()}` : now.getDate()}`;
            now.setDate(now.getDate() + 1);
            const to = `${now.getFullYear()}-${now.getMonth() < 9 ? `0${now.getMonth() + 1}` : now.getMonth() + 1}-${now.getDate() < 10 ? `0${now.getDate()}` : now.getDate()}`;
            const time = `${from} ~ ${to}`;
            body.append('time', time);
            return await (await fetch(u, { method: 'POST', body })).json();
        }, `${url}search`);

        console.log('get matches ->', matches);

        const schedules = [];
        if (matches.code === 200 && matches.data.length > 0) {
            let schedule: any = {};
            for (const m of matches.data) {
                if (schedule.date !== m.start_date.split(' ')[0]) {
                    schedule = {
                        date: m.start_date.split(' ')[0],
                        matches: []
                    }
                    schedules.push(schedule);
                }
                schedule.matches.push({
                    name: `${m.match_name} ${m.small_match_name} ${m.fight_name}`,
                    time: m.start_date.split(' ')[1],
                    bo: `BO ${m.bo}`,
                    teamA: m.aTeam.team_name,
                    teamB: m.bTeam.team_name,
                    logoA: m.aTeam.image,
                    logoB: m.bTeam.image
                })
            }
        }

        await sleep(2000);

        await pages[0].close();

        pages = await browser.pages();

        for (let i = 0; i < leagues.length; i++) {
            const league: any = await pages[i].evaluate((l) => {
                const date = document.querySelector('div.lt_box i')?.textContent?.trim().split('至');
                // @ts-ignore
                l.start = date[0].trim().replaceAll('-', '/');
                // @ts-ignore
                l.end = date[1].trim().replaceAll('-', '/');
                // @ts-ignore
                l.location = document.querySelector('div.lt_box span').textContent.replaceAll(' ', '');
                // @ts-ignore
                l.prize = document.querySelector('div.lt_box span.price').textContent;
                // @ts-ignore
                l.content = document.querySelector('div.lt_box p').textContent;
                l.rules = '';
                document.querySelectorAll('div.tc_rule p').forEach(r => {
                    l.rules += r.textContent;
                    l.rules += '\n';
                });
                return l;
            }, leagues[i]);
            // @ts-ignore
            leagues[i] = league;
        }

        console.log("leagues->", JSON.stringify(leagues, null, 2));
        console.log("schedules->", JSON.stringify(schedules, null, 2));

        if (process.env.ENV === 'prod') {
            await login();
            await uploadLeagues(leagues);
            await uploadSchedules(schedules);
        }

        await browser.close();
    } catch (e) {
        console.error("crawler leagues error-->", e);
        process.exit(1);
    }
}

start();
