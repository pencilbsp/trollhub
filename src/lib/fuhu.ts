import { JSDOM } from "jsdom";
import CryptoJS from "crypto-js";

const userAgent =
  "Mozilla/5.0 (Linux; Android 13; SM-S911U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36";

const mobileHeaders = new Headers({ "User-Agent": userAgent });

export const decrypt = function (str: string, keyString: string, ivString: string) {
  const iv = CryptoJS.enc.Utf8.parse(ivString);
  const key = keyString.length < 32 ? keyString.padEnd(32, "\0") : keyString;
  return CryptoJS.AES.decrypt(str, CryptoJS.enc.Utf8.parse(key), {
    iv,
  }).toString(CryptoJS.enc.Utf8);
};

export const encrypt = function (str: string, keyString: string, ivString: string) {
  const iv = CryptoJS.enc.Utf8.parse(ivString);
  const key = keyString.length < 32 ? keyString.padEnd(32, "\0") : keyString;
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
  return chars.join("");
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

export function createComicURL(id: string, version = "0.0.8") {
  const payload = `${id}|${Date.now()}|${Date.now() - 62953}|idoitmyself.xyz|0.0.0|${version}`;
  return `https://idoitmyself.xyz/embed/${encrypt(payload, "--KpQG3w0km3imY", "b63e541bc9ece19a")
    .replaceAll("/", "_")
    .replaceAll("+", "-")
    .replaceAll("=", "")}`;
}

export async function comicParser(comicUrl: string) {
  let response = await fetch(comicUrl, { headers: mobileHeaders });
  let body = await response.text();
  body = body.replace(/\s\s+/g, " ");

  const dataString = /new\sComicViewer\((?<data>.*)\);\scomic\.run\(\)/.exec(body)?.groups?.data;
  if (!dataString) throw new Error("Không thể lấy dữ liệu.");

  const data = JSON.parse(
    dataString
      .replace(/[$\(\)]/g, "")
      .replace(/'/g, '"')
      .replace(/([\w_]*):/g, '"$1":')
  );

  const params = new URLSearchParams({
    t: "chapter",
    cid: data.comic_id,
    chid: data.chapter_id,
    sig: data.sig,
    v: data.version,
  });

  const restApi = new URL(comicUrl).origin + "/content/rest?" + params.toString();
  response = await fetch(restApi, { headers: mobileHeaders });
  const comic = await response.json();
  if (comic.error) throw new Error(comic.error_msg);

  const { webp } = comic.data["sv1"];
  return imageDecrypt(webp);
}

export async function novelParser(url: string) {
  const response = await fetch(url, { headers: mobileHeaders });
  const body = await response.text();
  const {
    window: { document },
  } = new JSDOM(body);

  const elm = document.querySelector(".reading-viewport");
  return elm?.textContent?.trim() || "";
}
