import jsdom from 'jsdom';
import CryptoJS from 'crypto-js';

const { JSDOM } = jsdom;

export const COMIC_VERSION = '0.1.4';
export const VIDEO_VERSION = '0.1.1a';
export const WEB_SECRET_IV = 'f75b86843764e1f1';
export const WEB_SECRET_KEY = '/;`dc6>RB++jqGXq';
export const WEB_ENDPOIT = 'https://idoitmyself.xyz';
export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
export const MOBILE_USER_AGENT = 'Mozilla/5.0 (Linux; Android 13; SM-S911U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36';

const mobileHeaders = new Headers({ 'User-Agent': MOBILE_USER_AGENT });

export const decrypt = function (str: string, keyString: string, ivString: string) {
    const iv = CryptoJS.enc.Utf8.parse(ivString);
    const key = keyString.length < 32 ? keyString.padEnd(32, '\0') : keyString;
    return CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
        iv,
    }).toString(CryptoJS.enc.Utf8);
};

export const encrypt = function (str: string, keyString: string, ivString: string) {
    const iv = CryptoJS.enc.Utf8.parse(ivString);
    const key = keyString.length < 32 ? keyString.padEnd(32, '\0') : keyString;
    return CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
        iv,
    }).toString();
};

export function genKey(key: string) {
    const chars = [];
    const iwQRq = (a: number, b: number) => a * b;
    const KMOKT = (a: number, b: number) => a % b;
    for (let index = 0; index < key.length; index++) {
        chars.push(KMOKT(iwQRq(parseInt(key[index], 16), 5), 16).toString(16));
    }
    return chars.join('');
}

export function imageDecrypt(imgs: any) {
    const list: string[] = [].concat.apply([], imgs);

    return list.map((img) => {
        const iv = genKey(img[1].substr(-20, 16));
        const key = genKey(img[1].substr(9, 15));
        const imgURL = decrypt(img[0], key, iv);
        return imgURL;
    });
}

export async function comicParser(comicUrl: string) {
    let response = await fetch(comicUrl, { headers: mobileHeaders });
    let body = await response.text();
    body = body.replace(/\s\s+/g, ' ');

    const dataString = /new\sComicViewer\((?<data>.*)\);\scomic\.run\(\)/.exec(body)?.groups?.data;
    if (!dataString) throw new Error('Không thể lấy dữ liệu.');

    const data = JSON.parse(
        dataString
            .replace(/[$\(\)]/g, '')
            .replace(/'/g, '"')
            .replace(/([\w_]*):/g, '"$1":'),
    );

    const params = new URLSearchParams({
        t: 'chapter',
        cid: data.comic_id,
        chid: data.chapter_id,
        sig: data.sig,
        v: data.version,
    });

    const restApi = new URL(comicUrl).origin + '/content/rest?' + params.toString();
    response = await fetch(restApi, { headers: mobileHeaders });
    const comic = await response.json();
    if (comic.error) throw new Error(comic.error_msg);

    const { webp } = comic.data['sv1'];
    return imageDecrypt(webp);
}

export async function novelParser(url: string) {
    const response = await fetch(url, { headers: mobileHeaders });
    const body = await response.text();
    const {
        window: { document },
    } = new JSDOM(body);

    const elm = document.querySelector('.reading-viewport');
    if (!elm || !elm.textContent) throw new Error('Không tìm thấy phần từ reading-viewport');

    return elm.textContent.trim();
}

export function createEmbedUrl(id: string, version = VIDEO_VERSION, data?: string) {
    const payload = [id, Date.now(), Date.now() - 62953, new URL(WEB_ENDPOIT).hostname, '0.0.0', version];
    if (data) payload.push(data);
    return `${WEB_ENDPOIT}/embed/${encrypt(payload.join('|'), '--KpQG3w0km3imY', 'b63e541bc9ece19a').replaceAll('/', '_').replaceAll('+', '-').replaceAll('=', '')}`;
}

export function hlsKey(key: any) {
    key = key.replace(/^0x/, '');
    key = key.match(/[\dA-F]{2}/gi)?.map((e: string) => parseInt(e, 16));

    return 'data:text/plain;base64,' + Buffer.from(key).toString('base64');
}

type Sengment = {
    isKey: boolean;
    uri: string;
    iv: string;
    duration: number | string;
};

export function makeHlsPlaylist(segments: Sengment[]) {
    const contents = ['#EXTM3U', '#EXT-X-VERSION:3', '#EXT-X-TARGETDURATION:18', '#EXT-X-PLAYLIST-TYPE:VOD'];

    contents.push(
        ...segments.map(({ isKey, uri, duration, iv }) => {
            if (!isKey) return `#EXTINF:${duration},\n${uri}`;
            return `#EXT-X-KEY:METHOD=AES-128,URI="${uri}",IV=${iv}`;
        }),
    );

    contents.push('#EXT-X-ENDLIST');
    return contents.join('\n');
}
