const express = require('express')
const amqplib = require('amqplib')
const amqpUrl = process.env.AMQP_URL || 'amqp://localhost'

const app = express()
const port = 3000

const exch = 'api';
const queue = 'api-event'
const rkey = 'api.#'

let conn
let ch

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/api/message', async (req, res) => {
    const msg = { ...req.query, ts: new Date() }
    await ch.publish(exch, 'api.message', Buffer.from(JSON.stringify(msg)));

    res.send({ success: true })
})

async function main() {
    conn = await amqplib.connect(amqpUrl);
    ch = await conn.createChannel()

    await ch.assertExchange(exch, 'topic', { durable: true })
    await ch.assertQueue(queue, { durable: true });
    await ch.bindQueue(queue, exch, rkey);

    app.listen(port, () => {
        console.log(`RabbitMQ app listening at http://localhost:${port}`)
    })
}

main()