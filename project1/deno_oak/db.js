import { Pool } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import cfg from "./cfg.json" assert { type: "json" };
import { printInfo, printError} from "./utils.js";
import {TABLE_NAME} from "./consts.js";
import { createHash } from "https://deno.land/std@0.91.0/hash/mod.ts";

let client;

export async function addUrl(lurl, surl) {
    try {
        // let hash = createHash("md5")
        // hash.update(lurl)
        // let hashed_str = hash.toString();
        await client.queryObject(`INSERT INTO ${TABLE_NAME} (lurl, surl) VALUES ($1, $2)`, [lurl, surl]);
        printInfo(`Added ${lurl} <==> ${surl} to database`)
        return true
    } catch(e) {
        printError("Unable to add url to database: " + e)
        return false
    }
}

export async function updateUrl(id, surl) {
    try {
        await client.queryObject(`UPDATE ${TABLE_NAME} SET surl = $1 WHERE id = $2`, [surl, id])
        printInfo(`Updated ${id} ${surl} in database`);
    } catch(e) {
        printError("Unable to update url in database: " + e);
    }
}

export async function queryByLurl(lurl) {
    // let hash = createHash("md5")
    // hash.update(lurl)
    // let hashed_str = hash.toString();
    try {
        const result = await client.queryObject(`SELECT * FROM ${TABLE_NAME} WHERE lurl = $1`, [lurl]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0];
    } catch (e) {
        printError("Unable to query url in database: " + e);
        return null
    }
    
}

export async function queryBySurl(surl) {
    const result = await client.queryObject(`SELECT * FROM ${TABLE_NAME} WHERE surl = $1`, [surl])
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
}

export async function queryById(id) {
    const result = await client.queryObject(`SELECT * FROM ${TABLE_NAME} WHERE id = $1`, [id])
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
}

export async function queryRandom() {
    const result = await client.queryObject(`SELECT * FROM ${TABLE_NAME} ORDER BY RANDOM() LIMIT 1`)
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
}

async function connect() {
    try {
        let config = {}
        if (Deno.env.get("ENV") === "local") {
            config = {
                user: cfg.postgres.user,
                password: cfg.postgres.password,
                database: cfg.postgres.database,
                hostname: cfg.postgres.host,
                port: cfg.postgres.port,
            }
        }
        const CONCURRENT_CONNECTIONS = 2;
        const connectionPool = new Pool(config, CONCURRENT_CONNECTIONS);
        client = await connectionPool.connect();
        printInfo("Connected to database");
    } catch(e)  {
        printError("Unable to connect to database: " + e);
        Deno.exit(1);
    }
}
connect();