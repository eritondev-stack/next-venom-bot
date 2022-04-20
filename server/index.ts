import express, { Express, Request, Response } from 'express';
import * as http from 'http';
import next, { NextApiHandler } from 'next';
import * as socketio from 'socket.io';
import { Whatsapp } from 'venom-bot'
import * as venom from 'venom-bot'
const { Mida, MidaBroker, MidaMarketWatcher } = require("@reiryoku/mida");
Mida.use(require("@reiryoku/mida-ctrader"));

declare global {
    // eslint-disable-next-line no-var
    var SocketServer: socketio.Server;
    // eslint-disable-next-line no-var
    var Whatsapp: Whatsapp;
}



const access = {
    clientId: "3369_kGf0PTNhOrFR3myRVJ3U4vcNXsXPv6dKljqstauXfkxYabyvbd",
    clientSecret: "pH80pT5BQhedjuXU7KJmwd4nsIEXOHwE8QHdsJndE9RFEgxl4f",
    accessToken: "5r1BriH9jgSsYbcqQg3c-4WoYHP2bCbWGYIaBnxZlKA",
    cTraderBrokerAccountId: "22250731",
};

var allPairs = {}

async function getAccount() {
    const myAccount = await MidaBroker.login("cTrader", access);
    const symbols = await myAccount.getSymbols()


    for (let index = 0; index < symbols.length; index++) {
        const pair = symbols[index];
        await whats(pair, myAccount)

        /*        const price = await myAccount.getSymbolAsk("EURUSD")
                console.log(pair + ": " + price) */
    }
}


async function whats(symbol: any, myAccount: any) {

    const marketWatcher = new MidaMarketWatcher({ brokerAccount: myAccount, });
    try {
        await marketWatcher.watch(symbol, { watchTicks: true, });

        marketWatcher.on("tick", (event: any) => {
            const { tick, } = event.descriptor;
            allPairs = {
                ...allPairs,
                [symbol]: tick.bid
            }
            //console.log(symbol + ': ' + tick.bid);
            global.SocketServer.emit('ctrader', allPairs)
        });
    } catch (e) {
        console.log(e)
    }

}





//const ENDPOINT = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:3000' : "http://whatsapp-next.herokuapp.com";


/* function ping() {
    setInterval(function () {
        http.get(ENDPOINT);
        console.log('ping em 5 minutos')
    }, 6000); // every 5 minutes (300000)

}
 */
const port: number = parseInt(process.env.PORT || '3000', 10);
const dev: boolean = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
    const app: Express = express();
    const server: http.Server = http.createServer(app);
    const io: socketio.Server = new socketio.Server();
    io.attach(server, {
        transports: ['websocket'],
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    global.SocketServer = io

    app.get('/hello', async (_: Request, res: Response) => {
        res.send('Hello World')
    });

    io.on('connection', (socket: socketio.Socket) => {
        console.log('connection');
        socket.emit('status', 'Hello from Socket.io');

        socket.on('disconnect', () => {
            console.log('client disconnected');
        })

        socket.on('ww', () => {
            venom.create({
                session: 'next-token', //name of session
                catchQR: (qrCode: string) => {
                    socket.emit('QR', qrCode)
                },
                statusFind: (statusSession, session) => {
                    socket.emit('STATUS_SESSION', {
                        statusSession: statusSession,
                        sessionName: session
                    })
                }  // for version not multidevice use false.(default: true)
            })
                .then((client) => {
                    global.Whatsapp = client

                    setInterval(async () => {
                        try {
                            await global.Whatsapp.sendText('5511960655281@c.us', 'ping em 5 minutos')
                        } catch (error) {
                            console.log(error)
                        }
                    }, 60000)

                })
                .catch((erro) => {
                    console.log(erro);
                });

        })
    });

    app.all('*', (req: any, res: any) => nextHandler(req, res));

    server.listen(port, async () => {
        console.log(`> Ready on http://localhost:${port}`);
        /*  ping() */
        await getAccount()

    });
});




