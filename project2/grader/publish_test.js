import { connect } from "./deps.js";
const queueName = "submission_grade";

const connection = await connect({ hostname: "127.0.0.1" });

const channel = await connection.openChannel();

await channel.declareQueue({ queue: queueName, durable: true });
await channel.publish(
  { routingKey: queueName },
  { contentType: "application/json" },
  new TextEncoder().encode(
    JSON.stringify({
      user_id: "1",
      exercise_id: "1",
      code: "console.log('hello world')",
    }),
  ),
);
await connection.close();
