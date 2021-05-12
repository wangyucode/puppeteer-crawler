import axios from "axios";
import { DotaNews, DotaNewsNode } from "./types";

const server = process.env.ENV === 'prod' ? "https://wycode.cn" : "http://localhost:8082";
let token = "";

export async function uploadNews(news: DotaNews[]) {
    const res: any = await axios.put(`${server}/node/admin/dota/news`, news, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("uploadNews->", res.data);
}

export async function uploadNewsDetail(id: string, detail: DotaNewsNode[]) {
    const res: any = await axios.put(`${server}/node/admin/dota/news/${id}`, detail, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("uploadNewsDetail->", res.data);
}

export async function clearNews() {
    const res: any = await axios.delete(`${server}/node/admin/dota/news`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    console.log("clearNews->", res.data);
}

export async function login() {
    const res: any = await axios.get(`${server}/node/login`, {
        params: {
            u: process.env.WYCODE_ADMIN_USERNAME,
            p: process.env.WYCODE_ADMIN_PASSWORD
        }
    });
    if(process.env.ENV !== 'prod') console.log("login->", res.data);
    token = res.data.data;
}