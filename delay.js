const amqplib = require("amqplib");

(async () => {
	const queue = "tasks";
	const exchange = "delayed_exchange";
	try {
		const conn = await amqplib.connect("amqp://localhost");
		const ch1 = await conn.createChannel();
		await ch1.assertExchange(exchange, "x-delayed-message", {
			arguments: { "x-delayed-type": "direct" },
		});

		await ch1.assertQueue(queue);
		await ch1.bindQueue(queue, exchange, queue);

		// Listener
		ch1.consume(queue, (msg) => {
			if (msg !== null) {
				console.log("Received:", msg.content.toString());
				ch1.ack(msg);
			} else {
				console.log("Consumer cancelled by server");
			}
		});

		// Sender
		const ch2 = await conn.createChannel();
		const delay = 5000; // 5 seconds delay

		ch2.publish(exchange, queue, Buffer.from("something to do"), {
			headers: { "x-delay": delay },
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
