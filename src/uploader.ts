import axios from "axios";
import { DotaNews } from "./types";

export const server = process.env.ENV === 'prod' ? "https://wycode.cn" : "http://localhost:8082";
let token = "";

export async function uploadSchedules(schedules: any[]) {
    const res: any = await axios.put(`${server}/node/admin/dota/schedules`, schedules, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("uploadSchedule->", res.data);
}

export async function uploadLeagues(leagues: any[]) {
    const res: any = await axios.put(`${server}/node/admin/dota/leagues`, leagues, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("uploadLeagues->", res.data);
}

export async function uploadNews(news: DotaNews): Promise<number> {
    const res: any = await axios.post(`${server}/node/admin/dota/news`, news, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("uploadNews->", res.data);
    return res.data.payload;
}

export async function uploadHero(hero) {
    const res: any = await axios.post(`${server}/node/admin/dota/hero`, hero, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("uploadHero->", res.data);
}

export async function updateItem(item) {
    const res: any = await axios.post(`${server}/node/admin/dota/item`, item, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("updateItem->", res.data);
}

export async function login() {
    const res: any = await axios.get(`${server}/node/login`, {
        params: {
            u: process.env.WYCODE_ADMIN_USERNAME,
            p: process.env.WYCODE_ADMIN_PASSWORD
        }
    });
    console.log("login->", res.data);
    token = res.data.payload;
}