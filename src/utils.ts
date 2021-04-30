export function sleep(ms: number): Promise<number> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const staticUrl = Buffer.from('aHR0cHM6Ly9pbWcuZG90YTIuY29tLmNu', "base64").toString('utf-8');
// console.log(staticUrl);

export function convertImageUrl(url: string): string {
    return url.startsWith(staticUrl) ? 'https://wycode.cn' + url.substring(24) : url;
}
