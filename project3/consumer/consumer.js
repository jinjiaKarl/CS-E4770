import {
  Application,
  connect,
  oakCors,
  Router,
  ServerSentEvent,
} from "./deps.js";

// https://stackoverflow.com/questions/21630509/server-sent-events-connection-timeout-on-node-js-via-nginx

// when server sends message to an idle connection, it shows this following error, beacause the server does not know the client end that is dead.
//    at Object.respondWith (deno:ext/http/01_http.js:316:27)
// [uncaught application error]: Http - connection closed before message completed
//
async function start() {
  let targetMessage = [];
  let targetReply = [];
  setInterval(() => {
    console.log("message connection number: " + targetMessage.length);
    console.log("reply connection number: " + targetReply.length);
  }, 10000);
  const router = new Router();
  router
    .get("/", (ctx) => {
      ctx.response.body = { message: "Hello World!" };
    })
    .get("/sse/message", (ctx) => {
      // server-sent events
      // ctx.response.headers.set("Content-Type", "text/event-stream");
      // ctx.response.headers.set("Cache-Control", "no-cache");
      // ctx.response.headers.set("Connection", "keep-alive");
      const target = ctx.sendEvents();
      target.addEventListener("error", (event) => {
        target.close();
        console.log("message error ", event);
      });
      target.addEventListener("close", (event) => {
        console.log("message event close: ", event);
        targetMessage = targetMessage.filter((t) => t !== target);
      });
      targetMessage.push(target);
    })
    .get("/sse/reply", (ctx) => {
      const target = ctx.sendEvents();
      target.addEventListener("error", (event) => {
        console.log("message error ", event);
      });
      target.addEventListener("close", (event) => {
        console.log("reply event close: ", event);
        targetReply = targetReply.filter((t) => t !== target);
      });
      targetReply.push(target);
    });
  // rabbitmq connection
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
  // receive a maximum of 100 message unacknowledged messages at once
  await channel.qos({ prefetchCount: 100 });
  await channel.consume(
    { queue: queueName },
    async (args, props, data) => {
      try {
        let body = new TextDecoder().decode(data);
        body = JSON.parse(body);
        // TODO: process message
        // send message score to frontend by server-sent events
        if (targetMessage && body.message) {
          console.log("message -> ", body);
          const event = new ServerSentEvent("message", body);
          targetMessage.forEach((t) => {
            try {
              t.dispatchEvent(event);
            } catch (e) {
              console.log("an error occurred while dispatching event", e);
            }
          });
        }

        if (targetReply && body.reply) {
          console.log("reply -> ", body);
          const event = new ServerSentEvent("reply", body);
          targetReply.forEach((t) => {
            try {
              t.dispatchEvent(event);
            } catch (e) {
              console.log("an error occurred while dispatching event", e);
            }
          });
        }
        await channel.ack({ deliveryTag: args.deliveryTag });
      } catch (err) {
        console.log("error " + err);
        await channel.nack({ deliveryTag: args.deliveryTag, requeue: false });
      }
    },
  );

  const app = new Application();
  app.use(oakCors());
  app.use(router.routes());
  app.use(router.allowedMethods());
  console.log(`Starting server on :7779`);
  await app.listen({ port: 7779 });
  await connection.closed();
  console.log("Closed peacefully");
}

await start();
