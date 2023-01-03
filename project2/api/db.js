import { Pool } from "./deps.js";
import { murmurhash } from "./deps.js";
import cfg from "./cfg.json" assert { type: "json" };
import { redisConnect } from "./deps.js";
let client;
let redis;

export async function getData() {
  const result = await client.queryObject(`SELECT * FROM exercises`);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows;
}

export async function createUser(username) {
  const result = await client.queryObject(
    `INSERT INTO users (username) VALUES ($1) RETURNING *`,
    [username],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function getUser(username) {
  const result = await client.queryObject(
    `SELECT * FROM users WHERE username = $1`,
    [username],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function writeResult(username_id, exercise_id, code, grade) {
  const code_hash = new murmurhash(code).result();
  const time = new Date().toISOString();
  const result = await client.queryObject(
    `INSERT INTO results (code_hash, u_id,e_id, grade, created_at) VALUES ($1,$2,$3,$4,$5)`,
    [code_hash, username_id, exercise_id, grade, time],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function getResult(username_id, exercise_id, code) {
  const code_hash = new murmurhash(code).result();
  // 从缓存中获取结果
  const res = await redis.hget(`${username_id}`, `${exercise_id}-${code_hash}`);
  if (res) {
    console.log("hit cache");
    return JSON.parse(res);
  }

  const result = await client.queryObject(
    `SELECT * FROM results WHERE u_id = $1 AND e_id = $2 AND code_hash = $3`,
    [username_id, exercise_id, code_hash],
  );
  if (result.rows.length === 0) {
    return null;
  }

  await redis.hset(
    `${username_id}`,
    `${exercise_id}-${code_hash}`,
    JSON.stringify({
      grade: result.rows[0].grade,
    }),
  );

  return result.rows[0];
}

export async function getCompletedExercises(user_id) {
  // TODO: return best grades(pass, fail, error)
  const result = await client.queryObject(
    `SELECT e_id FROM results WHERE u_id = $1`,
    [user_id],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows;
}

async function connect() {
  try {
    let config = {};
    if (Deno.env.get("ENV") === "local") {
      config = {
        user: cfg.postgres.user,
        password: cfg.postgres.password,
        database: cfg.postgres.database,
        hostname: cfg.postgres.host,
        port: cfg.postgres.port,
      };
    }
    const CONCURRENT_CONNECTIONS = 2;
    const connectionPool = new Pool(config, CONCURRENT_CONNECTIONS);
    client = await connectionPool.connect();

    const hostname = Deno.env.get("REDIS_HOST") || "localhost";
    redis = await redisConnect({
      hostname: hostname,
      port: 6379,
    });
  } catch (e) {
    console.log(e);
    Deno.exit(1);
  }
}
connect();
