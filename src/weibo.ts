import * as dotenv from "dotenv";
import * as fs from 'fs/promises';
import axios from "axios";
import xlsx from 'node-xlsx';
import { get } from "lodash";
import { sleep } from "./utils";
import { parse } from 'node-html-parser';

async function main() {
    const key = '冬奥会';
    let page = 1;
    const result = [['用户', '时间', '内容', '点赞数量', '转发数量', '评论数量']];
    try {
        //     for (let page = 1; page < 10; page++) {
        const url = `${Buffer.from('aHR0cHM6Ly9tLndlaWJvLmNuL2FwaS9jb250YWluZXIvZ2V0SW5kZXg=', "base64").toString('utf-8')}?containerid=100103type=1&q=${encodeURI(key)}&page_type=searchall&page=${page}`;
        const res = await axios.get(url);

        res.data.data.cards.forEach(async it => {
            const mblog = get(it, ['card_group', '0', 'mblog']);
            if (mblog) {
                const text = parse(mblog.text).textContent;
                result.push([mblog.user.screen_name, mblog.created_at, text, mblog.attitudes_count, mblog.reposts_count, mblog.comments_count]);
            }
        });
        await sleep(10);
        // }

        const buffer = xlsx.build([{ name: 'sheet1', data: result, options: null }]);
        await fs.writeFile(`${key}.xlsx`, buffer);

    } catch (e) {
        console.error("crawler flight error-->", e);
        // process.exit(1);
    }
}

dotenv.config();
main();