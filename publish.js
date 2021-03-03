const amqplib = require('amqplib')
const amqpUrl = process.env.AMQP_URL || 'amqp://localhost'

async function do_publish() {
    const conn = await amqplib.connect(amqpUrl);
    const ch = await conn.createChannel()
    const exch = 'ecommerce';

    const queues = [
        {
            name: 'event',
            rkey: 'event.#'
        },
        {
            name: 'event-addtocart',
            rkey: 'event.addtocart'
        },
        {
            name: 'event-checkout',
            rkey: 'event.checkout'
        },
        {
            name: 'event-view',
            rkey: 'event.view'
        }
    ]

    console.log('Creating Exchange')
    await ch.assertExchange(exch, 'topic', { durable: true })

    console.log('Creating & Binding Queue')
    for (const item of queues) {
        await ch.assertQueue(item.name, { durable: true });
        await ch.bindQueue(item.name, exch, item.rkey);
    }

    const events = ['addtocart', 'checkout', 'view']
    setInterval(async function () {
        let event = events[Math.floor(Math.random() * events.length)];
        let rkey = `event.${event}`

        let msg = {
            event,
            rkey,
            ts: new Date()
        }

        await ch.publish(exch, rkey, Buffer.from(JSON.stringify(msg)));
        console.log(`Publish message = ${JSON.stringify(msg)}`)

    }, 2000);

}

do_publish()