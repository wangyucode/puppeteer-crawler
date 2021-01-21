const puppeteer = require('puppeteer');

async function main() {
    const browser = await puppeteer.launch({
        devtools: true,
        defaultViewport: null
    });
    const page = await browser.newPage();
    await page.goto('https://www.dota2.com.cn/heroes/index.htm');
    const links = await page.evaluate(() => {
        const links = []
        document.querySelectorAll('.heroPickerIconLink').forEach(it => links.push(it.href));
        return links;
    });
    console.log(links);
    await browser.close();
}

main();