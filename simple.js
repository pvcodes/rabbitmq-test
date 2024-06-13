const amqplib = require("amqplib");

(async () => {
    const queue = "tasks";
    try {
        const conn = await amqplib.connect("amqps://ikhdzdba:8__y72Qo8k6YCHmBXYwp7DiZQ8ufmN_S@puffin.rmq2.cloudamqp.com/ikhdzdba");
        const ch = await conn.createChannel();
        await ch.assertQueue(queue);

        // Send a test message
        await ch.sendToQueue(queue, Buffer.from("test message"));

        // Consume the test message
        ch.consume(queue, (msg) => {
            if (msg !== null) {
                console.log("Received:", msg.content.toString());
                ch.ack(msg);
            } else {
                console.log("Consumer cancelled by server");
            }
        });

        conn.on("close", () => {
            console.error("Connection closed");
        });

        conn.on("error", (err) => {
            console.error("Connection error", err);
        });
    } catch (err) {
        console.error("Error occurred", err);
    }
})();
