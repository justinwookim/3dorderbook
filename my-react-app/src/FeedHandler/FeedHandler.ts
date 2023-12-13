import { OrderBook, Order, orderType } from '../OrderBook';

export class KrakenFeedHandler {
    private webSocket: WebSocket | undefined;
    private readonly webSocketUrl: string = 'wss://ws.kraken.com';
    private isConnected: boolean = false;
    private orderBook: OrderBook;
    private tradingSymbol: string = '';

    constructor(tradingSymbol: string) {
        this.tradingSymbol = tradingSymbol;
        this.orderBook = new OrderBook();
    }

    private getWebSocket(): WebSocket {
        if (!this.webSocket) {
            throw new Error('WebSocket connection not established.');
        }
        return this.webSocket;
    }

    onOpen(event: Event) {
        const subscribeBook = {
            event: 'subscribe',
            subscription: {
                name: 'book',
                depth: 1000,
            },
            pair: [this.tradingSymbol]
        };
        this.getWebSocket().send(JSON.stringify(subscribeBook));

        const subscribeTrades = {
            event: 'subscribe',
            subscription: {
                name: 'trade',
            },
            pair: [this.tradingSymbol]
        };
        this.getWebSocket().send(JSON.stringify(subscribeTrades));
    }

    onMessage(event: MessageEvent) {
        const msg = JSON.parse(event.data as string);

        if (!Array.isArray(msg)) {
            return;
        }

        const [reqIds, data, typ, pair] = msg;

        if (`${typ}`.startsWith('book-')) {
            this.handleOrderBookEvent(data);
        }
        if (typ === "trade") {
            this.handleTradeEvent(data);
        }
    }

    connect() {
        console.log(`Connecting to Kraken WebSocket feed.`);
        this.webSocket = new WebSocket(this.webSocketUrl);
        this.webSocket.onopen = this.onOpen.bind(this);
        this.webSocket.onmessage = this.onMessage.bind(this);
        this.isConnected = true;
    }

    disconnect() {
        if (!this.isConnected) return;
        console.log(`Disconnecting from Kraken WebSocket feed.`);
        this.getWebSocket().close();
        this.webSocket = undefined;
        this.isConnected = false;
    }

    handleOrderBookEvent(data: any) {
        const isSnapshot = "as" in data || "bs" in data;

        const processLevel = (level: any[], type: orderType) => {
            const price = parseFloat(level[0]);
            const quantity = parseFloat(level[1]);
            return { price, quantity, orderType: type };
        };

        if (isSnapshot) {
            this.orderBook = new OrderBook(); // Reset order book for snapshot
        }

        (data.b ?? data.bs ?? []).forEach((bid: any) => {
            const order = processLevel(bid, orderType.BUY);
            this.orderBook.addOrder(order);
        });

        (data.a ?? data.as ?? []).forEach((ask: any) => {
            const order = processLevel(ask, orderType.SELL);
            this.orderBook.addOrder(order);
        });

        // Optionally, match orders after each update
        this.orderBook.matchOrders();
    }

    handleTradeEvent(data: any[]) {
        // Handle trade data
        data.forEach(d => {
            const tradePrice = parseFloat(d[0]);
            const tradeSize = parseFloat(d[1]);
            const tradeSide = d[3] === 'b' ? orderType.BUY : orderType.SELL;
            console.log(`Trade executed: ${tradeSize} at price ${tradePrice} on side ${tradeSide}`);
        });
    }
}