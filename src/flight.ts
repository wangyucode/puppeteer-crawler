import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import * as dotenv from "dotenv";

async function main() {
    const url = Buffer.from('aHR0cHM6Ly9mbGlnaHRzLmN0cmlwLmNvbS9pbnRlcm5hdGlvbmFsL3NlYXJjaC9vbmV3YXktYW1tLXl0bz9kZXBkYXRlPTIwMjEtMDYtMjMmY2FiaW49eV9zJmFkdWx0PTEmY2hpbGQ9MCZpbmZhbnQ9MA==', "base64").toString('utf-8');

    try {
        const browser = await puppeteer.launch({
            devtools: process.env.ENV === 'dev',
            defaultViewport: null
        });

        const pages = await browser.pages();
        console.log('goto->', url);
        await pages[0].goto(url);
        const flights =  await pages[0].evaluate(() => {
            const flights = [];
            
            document.querySelectorAll('div.flight-list.root-flights > span > div > div').forEach((it: any) => {
                if(it.querySelector('div.airline-name')){
                    flights.push({
                        name: it.querySelector('div.airline-name > span').textContent,
                        departTime: it.querySelector('div.depart-box > div.time').textContent,
                        departPort: it.querySelector('div.depart-box > div.airport').textContent,
                        arriveTime: it.querySelector('div.arrive-box > div.time').textContent,
                        arrivePort: it.querySelector('div.arrive-box > div.airport').textContent,
                        consume: it.querySelector('div.flight-consume').textContent,
                    });
                }
                
            });
            return flights;
        });

        console.log(flights);

        await browser.close();

    } catch (e) {
        console.error("crawler flight error-->", e);
        process.exit(1);
    }
}

dotenv.config();
main();