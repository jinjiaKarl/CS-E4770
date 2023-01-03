import { Application, connect, oakCors, Router } from "./deps.js";
import {
  connectDb,
  createMessage,
  createReply,
  createUser,
  getMessageById,
  getMessagesOnNextToken,
  getRepliesByMessageId,
  getUserByToken,
  updateMessageScore,
} from "./db.js";

async function start() {
  // db connection
  await connectDb();
  // amqp connection
  let connection = null;
  if (Deno.env.get("MQHOST")) {
    const hostname = Deno.env.get("MQHOST");
    const user = Deno.env.get("MQUSER");
    const password = Deno.env.get("MQPASS");
    console.log(hostname, user, password);
    connection = await connect({
      hostname: hostname,
      username: user,
      password: password,
    });
  } else {
    const hostname = Deno.env.get("HOSTNAME") || "localhost";
    connection = await connect({ hostname: hostname });
  }

  const channel = await connection.openChannel();
  const queueName = "message_queue";
  await channel.declareQueue({ queue: queueName, durable: true });

  async function publish(queueName, msg, type) {
    let paypoad = null;
    if (type === "message") {
      paypoad = JSON.stringify({
        message: msg,
      });
    } else if (type === "reply") {
      paypoad = JSON.stringify({
        reply: msg,
      });
    }
    await channel.publish(
      { routingKey: queueName },
      { contentType: "application/json" },
      new TextEncoder().encode(paypoad),
    );
  }

  const router = new Router();
  router
    .get("/", (ctx) => {
      ctx.response.body = { message: "Hello World!" };
    })
    .post("/login", async (ctx) => {
      const body = ctx.request.body();
      const { token } = await body.value;
      const user = await createUser(token);
      ctx.response.body = {
        user: user,
      };
    })
    .get("/message", async (ctx) => {
      //get all messages
      let maxResults = 20;
      let nextToken = "";

      if (ctx.request.url.searchParams.has("maxResults")) {
        maxResults = ctx.request.url.searchParams.get("maxResults");
      }
      if (ctx.request.url.searchParams.has("nextToken")) {
        nextToken = ctx.request.url.searchParams.get("nextToken");
      }
      const messages = await getMessagesOnNextToken(maxResults, nextToken);
      console.log("request params: ", maxResults, nextToken, messages);
      if (messages === null) {
        ctx.response.body = {
          messages: [],
          nextToken: "",
        };
        return;
      }
      ctx.response.body = messages;
    })
    .post("/message", async (ctx) => {
      //create a message
      const body = ctx.request.body();
      const { token, message } = await body.value;
      const user = await getUserByToken(token);
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Unauthorized" };
        return;
      }
      const msg = await createMessage(user.id, message);
      // publish message to queue
      await publish(queueName, msg, "message");
      ctx.response.body = {
        message: msg,
      };
    })
    .get("/message/:id", async (ctx) => {
      //get a message by id
      const id = ctx.params.id;
      const message = await getMessageById(id);
      ctx.response.body = {
        message: message,
      };
    })
    .post("/message/:id", async (ctx) => {
      // reply to a message
      const mid = ctx.params.id;
      const body = ctx.request.body();
      const { token, reply } = await body.value;
      const user = await getUserByToken(token);
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Unauthorized" };
        return;
      }
      const replyV = await createReply(user.id, mid, reply);
      await publish(queueName, replyV, "reply");
      ctx.response.body = {
        reply: replyV,
      };
    })
    .get("/message/:id/replies", async (ctx) => {
      // get replies to a message
      const mid = ctx.params.id;
      const replies = await getRepliesByMessageId(mid);
      ctx.response.body = {
        replies: replies,
      };
    })
    .post("/message/:id/vote", async (ctx) => {
      // vote
      const mid = ctx.params.id;
      const msg = await updateMessageScore(mid, 1, "vote");
      await publish(queueName, msg, "message");
      ctx.response.body = {
        message: msg,
      };
    })
    .post("/message/:id/unvote", async (ctx) => {
      // unvote
      const mid = ctx.params.id;
      const msg = await updateMessageScore(mid, 1, "unvote");
      await publish(queueName, msg, "message");
      ctx.response.body = {
        message: msg,
      };
    });

  const app = new Application();
  app.use(oakCors());
  app.use(router.routes());
  app.use(router.allowedMethods());

  console.log(`Starting server on :7777`);
  await app.listen({ port: 7777 });
  await connection.close();
}

await start();
