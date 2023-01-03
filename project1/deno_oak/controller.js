import {queryByLurl, addUrl, queryById, queryBySurl, updateUrl, queryRandom} from './db.js';
import {toBaseN, getRandomString, printInfo, printError} from './utils.js';
import cfg from "./cfg.json" assert { type: "json" };
import {URL_SIZE} from './consts.js';
import Murmurhash3 from "https://deno.land/x/murmurhash/mod.ts";

// need two reads, two writes, too bad
export async function generateShortendUrlByDB(lurl) {
    let result = await queryByLurl(lurl);
    if (result !== null && result.surl !== null && result.surl !== "") {
        const surl =  `${cfg.protocol}://${cfg.shortenedDomain}/${result.surl}`
        return surl
    }
    // generate incrementing id
    if (result === null) {
        await addUrl(lurl, "")
    }
    result = await queryByLurl(lurl)
    const id = toBaseN(result.id, 62)
    const surl =  `${cfg.protocol}://${cfg.shortenedDomain}/${id}`
    await updateUrl(result.id, id)
    return surl
}

export async function generateShortendUrlByRandomString(lurl) {
    let result = await queryByLurl(lurl);
    if (result !== null && result.surl !== null && result.surl !== "") {
        const surl =  `${cfg.protocol}://${cfg.shortenedDomain}/${result.surl}`
        return surl
    }
    // generate random string
    const str = getRandomString(URL_SIZE)
    const surl =  `${cfg.protocol}://${cfg.shortenedDomain}/${str}`
    const success = await addUrl(lurl, str)
    if (success) {
        return surl
    }
    printError(`occur conflict when generate random string: ${lurl} ${surl}`)
    // TODO: conflict, try again
}

export async function generateShortendUrlByHash(lurl) {
    let result = await queryByLurl(lurl);
    if (result !== null && result.surl !== null && result.surl !== "") {
        const surl =  `${cfg.protocol}://${cfg.shortenedDomain}/${result.surl}`
        return surl;
    }
    // generate hash string
    const str =  new Murmurhash3(lurl).result()
    const id = toBaseN(str, 62)
    const surl =  `${cfg.protocol}://${cfg.shortenedDomain}/${id}`
    const success = await addUrl(lurl, id)
    if (success) {
        return surl
    }
    printError(`occur conflict when generate hash string: ${lurl} ${surl}`)
    // TODO: conflict, try again
}

export async function getLongUrlById(id) {
    const result = await queryById(id);
    if (result === null) {
        return null;
    }
    return result.lurl;
}

export async function getLongUrlBySurl(surl) {
    const result = await queryBySurl(surl);
    if (result === null) {
        return null;
    }
    return result.lurl;
}


export async function shorten(ctx) {
    const body = ctx.request.body() 
    const data = await body.value // note, this is a promise
    const lurl = data.url
    let surl = ""
    if (cfg.method === 'db') {
        surl = await generateShortendUrlByDB(lurl);
    } else {
        surl = await generateShortendUrlByRandomString(lurl);
    }
    ctx.response.body = {url: surl};
}


export async function redirect(ctx) {
    // let surl = ctx.request.url.href // 注意这里url是一个URL对象，如果数据库中存储的的是全部的url
    let surl = ctx.params.shortId
    const lurl = await getLongUrlBySurl(surl);
    surl = `${cfg.protocol}://${cfg.shortenedDomain}/${surl}`
    //printInfo(lurl+":"+surl)
    if (lurl === null) {
        ctx.response.status = 404;
        return;
    }
    ctx.response.redirect(lurl);
}


export async function random(ctx) {
    const urlmap = await queryRandom()
    ctx.response.redirect(urlmap.lurl);
}