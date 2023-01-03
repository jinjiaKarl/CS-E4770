require('dotenv').config()
const e = require('express')
const { Pool } = require('pg')
let pool

async function queryAll() {
    const res = await pool.query('SELECT * FROM short_url_map')
    console.log(res.rows)
}

async function addUrl(lurl, surl) {
    try {   
        const res = await pool.query('INSERT INTO short_url_map (lurl, surl) VALUES ($1, $2) RETURNING *', [lurl, surl])
        return res.rows[0]
    } catch(e) {
        console.log("Unable to add url to database: " + e)
        return null
    }
}

async function updateUrl(id, surl) {
    try {
        await pool.query('UPDATE short_url_map SET surl = $1 WHERE id = $2', [surl, id])
        //console.log(`Updated ${id} ${surl} in database`);
    } catch(e) {
        console.log("Unable to update url in database: " + e);
    }
}

async function queryByLurl(lurl) {
    try {
        const result = await pool.query('SELECT * FROM short_url_map WHERE lurl = $1', [lurl])
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch(e) {
        console.log("Unable to query url in database: " + e);
        return null
    }
}

async function queryBySurl(surl) {
    try {
        const result = await pool.query('SELECT * FROM short_url_map WHERE surl = $1', [surl])
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch(e) {
        console.log("Unable to query url in database: " + e);
        return null
    }
}

async function queryById(id) {
    try {
        const result = await pool.query('SELECT * FROM short_url_map WHERE id = $1', [id])
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch(e) {
        console.log("Unable to query url in database: " + e);
        return null
    }
}

async function queryRandom(){
    const res = await pool.query('SELECT * FROM short_url_map ORDER BY RANDOM() LIMIT 1')
    return res.rows[0]
}

async function connect() {
    let config = {}
    if (process.env.MODE === "local") {
        config = {
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            hostname: process.env.PGHOST,
            port:  process.env.PGPORT
        }
    }
    pool = new Pool(config)
    try {
       await pool.connect()
    }catch(e){
        console.log("Unable to connect to database: " + e)
        process.exit()
    }
}

function disconnect() {
    pool.end()
}

module.exports = {
    connect,
    queryAll,
    disconnect,
    addUrl,
    updateUrl,
    queryByLurl,
    queryBySurl,
    queryById,
    queryRandom
}