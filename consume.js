const amqplib = require('amqplib');
const amqpUrl = process.env.AMQP_URL || 'amqp://localhost';

async function do_consume() {
    let conn = await amqplib.connect(amqpUrl);
    let ch = await conn.createChannel()
    let q = 'event';

    await ch.assertQueue(q, { durable: true });
    await ch.prefetch(1500);

    await ch.consume(q, async function (msg) {
        await processing(msg)
        ch.ack(msg);
    }, { consumerTag: 'node-worker' });

}

async function processing(msg) {
    console.log(msg.content.toString())
}

do_consume();