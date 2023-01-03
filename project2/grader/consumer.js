import { connect } from "./deps.js";
import { grade } from "./grade.js";
import { getResult, writeResult } from "./db.js";

const hostname = Deno.env.get("HOSTNAME") || "localhost";

const connection = await connect({ hostname: hostname });
const channel = await connection.openChannel();

const queueName = "submission_grade";
await channel.declareQueue({ queue: queueName, durable: true });
// receive a maximum of 100 message unacknowledged messages at once
await channel.qos({ prefetchCount: 100 });
await channel.consume(
  { queue: queueName },
  async (args, props, data) => {
    try {
      let body = new TextDecoder().decode(data);
      body = JSON.parse(body);
      let res = await getResult(body.user_id, body.exercise_id, body.code);
      if (res) {
        console.log("result already exists");
        await channel.ack({ deliveryTag: args.deliveryTag });
        return;
      }
      res = await grade(body.code);
      await writeResult(body.user_id, body.exercise_id, body.code, res);
      await channel.ack({ deliveryTag: args.deliveryTag });
    } catch (err) {
      console.log(err);
      await channel.nack({ deliveryTag: args.deliveryTag, requeue: false });
    }
  },
);

connection.closed().then(() => {
  console.log("Closed peacefully");
}).catch((error) => {
  console.error("Connection closed with error");
  console.error(error.message);
});
