import puppeteer from "puppeteer/lib/cjs/puppeteer/node-puppeteer-core";
import axios from "axios";
import * as dotenv from "dotenv";
import { MongoDota2Hero, MongoHeroDetail } from "./types";
import * as readline from "readline";
import evaluate = require("./evaluate-detail");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


async function main() {


    const listUrl = Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2RhdGFmZWVkL2hlcm9MaXN0P3Rhc2s9aGVyb2xpc3Q=', 'base64').toString('utf-8');
    console.log("listUrl->", listUrl);
    const res = await axios.get(listUrl);

    console.log(res.data.result.heroes);

    // const browser = await puppeteer.launch({
    //     devtools: true,
    //     defaultViewport: null
    // });
    // const pages = await browser.pages();

    // await pages[0].goto(Buffer.from('aHR0cHM6Ly93d3cuZG90YTIuY29tLmNuL2hlcm9lcy9pbmRleC5odG0=', 'base64').toString('utf-8'));
    // const links = await pages[0].evaluate(() => {
    //     const links = [];
    //     document.querySelectorAll('.heroPickerIconLink').forEach((it: HTMLLinkElement) => links.push(it.href));
    //     return links;
    // });
    // rl.write(`共获取到 ${links.length} 个英雄\n`);

    // for (let link of links) {
    //     await pages[0].goto(link);
    //     await sleep(1000);
    //     const hero: MongoHeroDetail | any = await pages[0].evaluate(evaluate).catch(console.error);

    //     if (!hero) {
    //         rl.write(`出错！：${link}`);
    //         continue;
    //     }

    //     rl.write(`比对 ${hero.name}\n`);

    //     const res: MongoHeroDetail | any = await axios.get(`${server}/api/public/dota/heroDetail`, {
    //         params: {
    //             heroName: hero.name
    //         }
    //     }).catch(console.error);
    //     const heroOnServer = res.data.data;

    //     if (!heroOnServer) {
    //         rl.write(`${hero.name} 详情不存在，保存...\n`);
    //         await updateHeroDetail(hero);
    //     } else {
    //         let needUpdate = false;
    //         for (let key of Object.keys(heroOnServer)) {
    //             if (key === 'abilities') {
    //                 for (let ability of hero.abilities) {
    //                     rl.write(`比对 ${hero.name} 的 ${ability.name} 技能\n`);
    //                     let abilityOnServer = heroOnServer.abilities.find(it => it.name === ability.name);
    //                     if (!abilityOnServer) {
    //                         rl.write(`${hero.name} 的技能 ${ability.name} 不存在\n`);
    //                         heroOnServer.abilities.push(ability);
    //                         needUpdate = true;
    //                     } else {
    //                         for (let abilityKey of Object.keys(abilityOnServer)) {
    //                             if (abilityKey === 'attributes') {
    //                                 if (ability.attributes) {
    //                                     rl.write(`${hero.name} 的技能 ${ability.name} 属性进行赋值\n`);
    //                                     abilityOnServer.attributes = ability.attributes;
    //                                     // needUpdate = true;
    //                                 }
    //                             } else if (ability[abilityKey] && ability[abilityKey] !== abilityOnServer[abilityKey]) {
    //                                 rl.write(`ability.${abilityKey} is ${typeof ability[abilityKey]} = ${ability[abilityKey]}  -->\n`);
    //                                 rl.write(`abilityOnServer.${abilityKey} is ${typeof abilityOnServer[abilityKey]} = ${abilityOnServer[abilityKey]} \n`);
    //                                 abilityOnServer[abilityKey] = ability[abilityKey];
    //                                 needUpdate = true;
    //                             }
    //                         }
    //                     }
    //                 }

    //                 heroOnServer.abilities = heroOnServer.abilities.filter(it => {
    //                     const ability = hero.abilities.find(a => a.name === it.name);
    //                     if (ability) {
    //                         return true;
    //                     } else {
    //                         rl.write(`${it.name}, 已经不存在！\n`);
    //                         needUpdate = true;
    //                         return false;
    //                     }
    //                 });
    //             } else if (hero[key] && hero[key] !== heroOnServer[key]) {
    //                 rl.write(`hero.${key} is ${typeof hero[key]} = ${hero[key]}  -->\n`);
    //                 rl.write(`heroOnServer.${key} is ${typeof heroOnServer[key]} = ${heroOnServer[key]} \n`);
    //                 heroOnServer[key] = hero[key];
    //                 needUpdate = true;
    //             }
    //         }

    //         if (needUpdate) {
    //             rl.write(`${hero.name} 详情发生以上变化，保存...\n`);
    //             await updateHeroDetail(heroOnServer);
    //         } else {
    //             rl.write(`${heroOnServer.name} 的详情没有变化,继续...\n`);
    //         }
    //     }
    // }

    // await browser.close();
    rl.close();
}

// async function updateHeroDetail(hero: MongoHeroDetail) {
//     if (!token) {
//         await login();
//     }

//     const res: any = await axios.post(`${server}/api/public/admin/dota/hero/detailInfo`, hero, {
//         headers: {
//             'X-Auth-Token': token
//         }
//     }).catch(console.error);
//     if(res.status === 200){
//         rl.write(`${hero.name} 保存成功！`);
//     }else{
//         rl.write(`${hero.name} 保存失败！`);
//     }

// }

// async function login() {
//     const res: any = await axios.get(`${server}/api/public/admin/user/login`, {
//         params: {
//             username: process.env.WYCODE_ADMIN_USERNAME,
//             password: process.env.WYCODE_ADMIN_PASSWORD
//         }
//     }).catch(console.error);
//     rl.write(JSON.stringify(res.data, null, 2));
//     token = res.data.data.token;
// }

// async function updateHeroBasic(hero: MongoDota2Hero) {
//     if (!token) {
//         await login();
//     }

//     const res = await axios.post(`${server}/api/public/admin/dota/hero/basicInfo`, hero, {
//         headers: {
//             'X-Auth-Token': token
//         }
//     }).catch(reason => console.error(reason));

//     console.log(res);
// }

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// function question(question: string): Promise<string> {
//     return new Promise(resolve => rl.question(question, resolve))
// }

dotenv.config();
main();
