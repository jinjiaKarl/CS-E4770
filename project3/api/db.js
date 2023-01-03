import { decode, encode, Pool } from "./deps.js";
import cfg from "./cfg.json" assert { type: "json" };
let client;

export async function createUser(token) {
  try {
    const result = await client.queryObject(
      `INSERT INTO users (token) VALUES ($1) RETURNING *`,
      [token],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (e) {
    if (e.message.includes("duplicate key value violates unique constraint")) {
      return await getUserByToken(token);
    }
    console.log(e);
  }
}

export async function getUserByToken(token) {
  const result = await client.queryObject(
    `SELECT * FROM users WHERE token = $1`,
    [token],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function createMessage(userId, text) {
  //console.log(new Date().toISOString());
  const result = await client.queryObject(
    `INSERT INTO messages (u_id, message, create_at) VALUES ($1, $2, $3) RETURNING *`,
    [userId, text, new Date().toISOString()],
  );
  if (result.rows.length === 0) {
    return null;
  }
  //console.log(result.rows[0].create_at);
  return result.rows[0];
}

export async function getMessagesOnNextToken(maxResults, nextToken) {
  let query = "";
  let params = [];
  if (nextToken === "") {
    query = `SELECT * FROM messages ORDER BY create_at DESC LIMIT $1`,
      params = [maxResults];
  } else {
    // decode nextToken
    const date = new TextDecoder().decode(decode(nextToken));
    query =
      `SELECT * FROM messages WHERE create_at < $1 ORDER BY create_at DESC LIMIT $2`,
      params = [date, maxResults];
  }
  const result = await client.queryObject(query, params);
  if (result.rows.length === 0) {
    return null;
  }
  return {
    messages: result.rows,
    nextToken: result.rows.length === maxResults
      ? encode(result.rows[result.rows.length - 1].create_at)
      : "",
  };
}

export async function getMessageById(id) {
  const result = await client.queryObject(
    `SELECT * FROM messages WHERE id = $1`,
    [id],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}
export async function getRepliesByMessageId(mid) {
  const result = await client.queryObject(
    `SELECT * FROM replies WHERE m_id = $1 ORDER BY create_at DESC`,
    [mid],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows;
}

export async function createReply(userId, messageId, reply) {
  const result = await client.queryObject(
    `INSERT INTO replies (u_id, m_id, reply, create_at) VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, messageId, reply, new Date().toISOString()],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function updateMessageScore(id, score, action) {
  let query = "";
  switch (action) {
    case "vote":
      query =
        `UPDATE messages SET score = score + $1 WHERE id = $2 RETURNING *`;
      break;
    case "unvote":
      query =
        `UPDATE messages SET score = score - $1 WHERE id = $2 RETURNING *`;
      break;
    default:
      console.log(action);
      return null;
  }
  const result = await client.queryObject(
    query,
    [score, id],
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

export async function connectDb() {
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
    } else {
      let PGPASS = Deno.env.get("PGPASS");
      console.log("PGPASS", PGPASS);
      if (PGPASS) {
        PGPASS = PGPASS.trim();
        const PGPASS_PARTS = PGPASS.split(":");
        const host = PGPASS_PARTS[0];
        const port = PGPASS_PARTS[1];
        const database = PGPASS_PARTS[2];
        const username = PGPASS_PARTS[3];
        const password = PGPASS_PARTS[4];
        config = {
          user: username,
          password: password,
          database: database,
          hostname: host,
          port: port,
        };
      }
    }
    const CONCURRENT_CONNECTIONS = 2;
    const connectionPool = new Pool(config, CONCURRENT_CONNECTIONS);
    client = await connectionPool.connect();
  } catch (e) {
    console.log(e);
    Deno.exit(1);
  }
}
