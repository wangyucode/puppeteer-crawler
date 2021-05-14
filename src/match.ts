import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import * as dotenv from "dotenv";
import { login, uploadSchedules, uploadTeams } from "./uploader";

async function start() {
    const url = Buffer.from('aHR0cHM6Ly93d3cudnBnYW1lLmNvbS9zY2hlZHVsZT9nYW1lX3R5cGU9ZG90YSZsYW5nPXpoX0NO', "base64").toString('utf-8');
    try {
        const browser = await puppeteer.launch({
            devtools: process.env.ENV === 'dev',
            defaultViewport: null
        });
        let pages = await browser.pages();
        console.log(url);
        await pages[0].goto(url, { timeout: 120 * 1000 });

        const schedules = await pages[0].evaluate(() => {
            const scheduleBoxes = document.querySelectorAll('div.schedulelist-list');
            const schedules = [];
            // @ts-ignore
            for (const box of scheduleBoxes) {
                const date = box.querySelector("div.schedulelist-list-date").textContent;

                const schedule = { date, matches: [] };

                const matchBoxes = box.querySelectorAll('div.schedulelist-list-item');
                
                for (const mbox of matchBoxes) {
                    const name = mbox.querySelector('ul > li:nth-child(1) > p').textContent;
                    const time = mbox.querySelector('span.times').textContent;
                    const bo = mbox.querySelector('span.box').textContent;
                    const teamA = mbox.querySelector('div.box > span:nth-child(1)').textContent;
                    const teamB = mbox.querySelector('div.box > span:nth-child(5)').textContent;
                    // @ts-ignore
                    const logoA = mbox.querySelector('div.box > span:nth-child(2) > img').src;
                    // @ts-ignore
                    const logoB = mbox.querySelector('div.box > span:nth-child(4) > img').src;

                    schedule.matches.push({ name, time, bo, teamA, teamB, logoA, logoB });
                }
                schedules.push(schedule);
            }

            return schedules;
        });

        const teams = await pages[0].evaluate(() => {
            const teams = [];

            const teamBoxes = document.querySelectorAll('li.ant-list-item');
            // @ts-ignore
             for (const box of teamBoxes) {
                const num = box.querySelector('div.rank').textContent;
                const point = box.querySelector('div.point').textContent;
                // @ts-ignore
                const logo = box.querySelector('div.team > span:nth-child(1) > img').src;
                const name = box.querySelector('div.team > span:nth-child(2)').textContent;

                teams.push({num,point,name,logo});
             }
             return teams;
        });


        console.log(JSON.stringify(schedules, null, 2));
        console.log(JSON.stringify(teams, null, 2));

        await login();
        await uploadTeams(teams);
        await uploadSchedules(schedules);
        if (!teams.length) {
            throw new Error('teams length = 0!');
        }
        if (!schedules.length) {
            throw new Error('schedules length = 0!');
        }

        await browser.close();
    } catch (e) {
        console.error("crawler schedules error-->", e);
        process.exit(1);
    }
}

dotenv.config();
start();
