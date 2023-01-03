import { Application, oakCors, Router } from "./deps.js";
import {
  createUser,
  getCompletedExercises,
  getData,
  getResult,
  getUser,
  writeResult,
} from "./db.js";
import { create, verify } from "./deps.js";
import { connect } from "./deps.js";

async function start() {
  // generate a random key for signing cookies
  // const key = await crypto.subtle.generateKey(
  //   { name: "HMAC", hash: "SHA-256" },
  //   true,
  //   ["sign", "verify"],
  // );
  // console.log(crypto.subtle.exportKey("jwk", key));
  const jwk = {
    kty: "oct",
    k: "Srml0gyK2Nwv0cIpdCyNnsMabot9WkBe90tft5ahAuE5q_NwB3SRLyNs1cW5IdKM1yRPzqs10xTvJVCSUFWZTw",
    alg: "HS256",
    key_ops: ["sign", "verify"],
    ext: true,
  };
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );

  const getToken = (ctx) => {
    let token = ctx.request.headers.get("Authorization");
    if (token && token.toLowerCase().startsWith("bearer ")) {
      token = token.substring(7);
    }
    return token;
  };

  // rabbitmq connection
  const hostname = Deno.env.get("HOSTNAME") || "localhost";
  const connection = await connect({ hostname: hostname });
  const channel = await connection.openChannel();
  const queueName = "submission_grade";
  await channel.declareQueue({ queue: queueName, durable: true });

  const router = new Router();
  router
    .get("/exercises", async (ctx) => {
      const data = await getData();
      ctx.response.body = { "data": data };
    })
    .post("/login", async (ctx) => {
      const body = ctx.request.body();
      const data = await body.value;
      const username = data.username;
      let user = await getUser(username);
      if (!user) {
        // deno insert data will not return the inserted data
        user = await createUser(username);
        //user = await getUser(username);
      }
      const token = await create({ alg: "HS256", typ: "JWT" }, {
        username: user.username,
        id: user.id,
      }, key);
      ctx.response.body = {
        token: token,
        username: user.username,
        id: user.id,
      };
    })
    .post("/grade", async (ctx) => {
      const token = getToken(ctx);
      try {
        // TODO: tempoparily remove verify token
        await verify(token, key);
        const body = ctx.request.body();
        const data = await body.value;
        const code = data.code;
        const exercise_id = data.exercise_id;
        const user_id = data.user_id;
        // 大量并发请求，会击穿
        const result = await getResult(user_id, exercise_id, code);
        if (result) {
          console.log("result already exists");
          ctx.response.body = { result: result.grade };
          return;
        }
        await channel.publish(
          { routingKey: queueName },
          { contentType: "application/json" },
          new TextEncoder().encode(JSON.stringify({
            user_id: user_id,
            exercise_id: exercise_id,
            code: code,
          })),
        );
        ctx.response.body = { result: "processing" };
      } catch (e) {
        console.log(e);
        ctx.response.status = 401;
        ctx.response.body = { error: "Invalid token" };
        return;
      }
    })
    .get("/completed", async (ctx) => {
      const token = getToken(ctx);
      try {
        const payload = await verify(token, key);
        const user_id = payload.id;
        const result = await getCompletedExercises(user_id);
        if (!result) {
          ctx.response.body = { result: [] };
          return;
        }
        const completedExercises = [];
        result.forEach((r) => {
          const u = completedExercises.find((e) => e === r.e_id);
          if (!u) {
            completedExercises.push(r.e_id);
          }
        });
        ctx.response.body = { result: completedExercises };
      } catch (e) {
        console.log(e);
        ctx.response.status = 401;
        ctx.response.body = { error: "Invalid token" };
        return;
      }
    })
    .post("/isCompleted", async (ctx) => {
      const token = getToken(ctx);
      try {
        await verify(token, key);
        const body = ctx.request.body();
        const data = await body.value;
        const code = data.code;
        const exercise_id = data.exercise_id;
        const user_id = data.user_id;
        const result = await getResult(user_id, exercise_id, code);
        if (!result) {
          ctx.response.body = { result: "processing" };
          return;
        }
        ctx.response.body = { result: result.grade };
      } catch (e) {
        console.log(e);
        ctx.response.status = 401;
        ctx.response.body = { error: "Invalid token" };
        return;
      }
    });

  const app = new Application();
  app.use(oakCors()); // Enable CORS for All Routes
  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log(`Starting server on :7777`);
  await app.listen({ port: 7777 });
  await connection.close();
}

await start();
