import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import axios from "axios";

let token = "";

// const server = 'http://localhost:8080/web';

const server = 'https://wycode.cn/web';

async function main() {

    let news = [];
    const url = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL25ld3MvaW5kZXg=', "base64").toString('utf-8')
    console.log(url);
    const browser = await puppeteer.launch({
        devtools: true,
        defaultViewport: null
    });
    const pages = await browser.pages();

    for (let i = 1; i < 6; i++) {
        await pages[0].goto(`${url}${i}.html`);
        await sleep(1000);
        const pageNews = await pages[0].evaluate(() => {
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

        news = news.concat(pageNews);
        // TODO
        break;
    }

    console.log(JSON.stringify(news, null, 2));

    for (const it of news) {
        await pages[0].goto(it.href);
        await sleep(1000);
    }

    //await browser.close();
}

async function updateHeroDetail(hero: any) {
    if (!token) {
        await login();
    }

    const res: any = await axios.post(`${server}/api/public/admin/dota/hero/detailInfo`, hero, {
        headers: {
            'X-Auth-Token': token
        }
    }).catch(console.error);
    if (res.status === 200) {
        console.log(`${hero.name} 保存成功！`);
    } else {
        console.log(`${hero.name} 保存失败！`);
    }

}

async function login() {
    const res: any = await axios.get(`${server}/api/public/admin/user/login`, {
        params: {
            username: process.env.WYCODE_ADMIN_USERNAME,
            password: process.env.WYCODE_ADMIN_PASSWORD
        }
    }).catch(console.error);
    console.log(JSON.stringify(res.data, null, 2));
    token = res.data.data.token;
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
