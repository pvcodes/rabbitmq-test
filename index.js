const amqplib = require("amqplib");

async function start() {
	try {
		const queue = "tasks";
		const exchange = "delayed_exchange";
		const conn = await amqplib.connect("amqp://localhost");

		// Create a channel and assert a delayed exchange
		const ch1 = await conn.createChannel();
		await ch1.assertExchange(exchange, "x-delayed-message", {
			arguments: { "x-delayed-type": "direct" },
		});

		console.log(43, "exchange created");

		// Assert the queue and bind it to the delayed exchange
		await ch1.assertQueue(queue);
		console.log(43, "queue asserted");
		await ch1.bindQueue(queue, exchange, queue);
		console.log(43, "queue binded");

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

		setInterval(() => {
			const delay = 5000; // Delay in milliseconds (5 seconds)
			ch2.publish(exchange, queue, Buffer.from("something to do"), {
				headers: { "x-delay": delay },
			});
			console.log(353, "publish ho ra hu");
		}, 1000);

		// Handle connection close
		conn.on("close", () => {
			console.error("Connection closed");
			process.exit(1);
		});

		// Handle connection error
		conn.on("error", (err) => {
			console.error("Connection error", err);
			process.exit(1);
		});
	} catch (err) {
		console.error("Error occurred", err);
		process.exit(1);
	}
}

start();
