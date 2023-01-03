const {queryByLurl, updateUrl, addUrl, queryBySurl, queryRandom} = require('./db')
const {toBaseN, getRandomString} = require('./utils')

async function generateShortendUrlByDB(lurl) {
    let result = await queryByLurl(lurl)
    if (result !== null && result.surl !== null && result.surl !== "") {
        const surl =  `${process.env.PROTOCOL}://${process.env.SHORT_DOMAIN}/${result.surl}`
        return surl
    }
    // generate incrementing id
    if (result === null) {
        result = await addUrl(lurl, "")
    } else {
        result = await queryByLurl(lurl)
    }

    const id = toBaseN(result.id, 62)
    const surl =  `${process.env.PROTOCOL}://${process.env.SHORT_DOMAIN}/${id}`
    await updateUrl(result.id, id)
    return surl
}


async function generateShortendUrlByRandomString(lurl) {
    let result = await queryByLurl(lurl);
    if (result !== null && result.surl !== null && result.surl !== "") {
        const surl =  `${process.env.PROTOCOL}://${process.env.SHORT_DOMAIN}/${result.surl}`
        return surl
    }
    // generate random string
    const str = getRandomString(8)
    const surl =  `${process.env.PROTOCOL}://${process.env.SHORT_DOMAIN}/${str}`
    const obj = await addUrl(lurl, str)
    if (obj !== null) {
        return surl
    }
    console.log(`occur conflict when generate random string: ${lurl} ${surl}`)
    // TODO: conflict, try again
}

async function getLongUrlById(id) {
    const result = await queryById(id);
    if (result === null) {
        return null;
    }
    return result.lurl;
}

async function getLongUrlBySurl(surl) {
    const result = await queryBySurl(surl);
    if (result === null) {
        return null;
    }
    return result.lurl;
}


async function shorten(req, resp) {
    const lurl = req.body.url
    let surl = ""
    if (process.env.METHOD === 'db') {
        surl = await generateShortendUrlByDB(lurl);
    } else {
        surl = await generateShortendUrlByRandomString(lurl);
    }
    resp.status(201).json({url: surl})
}


async function redirect(req, resp) {
    // const surl = req.protocol + '://' + req.get('host') + req.originalUrl
    const surl = req.params.shortId
    const lurl = await getLongUrlBySurl(surl);
    //console.log(lurl+" : "+surl)
    if (lurl === null) {
        resp.status(404).json({error: "Not found"})
        return
    }
    resp.redirect(lurl)
}


async function random(req, resp) {
    const res = await queryRandom()
    //console.log(res)
    resp.redirect(res.lurl)
}

module.exports = {
    shorten,
    redirect,
    random
}