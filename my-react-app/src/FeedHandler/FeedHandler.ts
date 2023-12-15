import { OrderBook, Order, orderType } from '../OrderBook';
import { BookAnimation } from '../3DBookAnimation';

export class KrakenFeedHandler {
    private webSocket: WebSocket | undefined;
    private readonly webSocketUrl: string = 'wss://ws.kraken.com';
    private isConnected: boolean = false;
    private orderBook: OrderBook;
    private tradingSymbol: string = '';
    private bookAnimation: BookAnimation | null = null;
    private updateOrderBookState: (updatedOrderBook: OrderBook) => void;

    constructor(tradingSymbol: string, orderBook: OrderBook, updateOrderBookState: (updatedOrderBook: OrderBook) => void) {
        this.tradingSymbol = tradingSymbol;
        this.orderBook = orderBook;
        this.updateOrderBookState = updateOrderBookState;
    }

    setBookAnimation(animation: BookAnimation) {
        this.bookAnimation = animation;
    }

    private getWebSocket(): WebSocket {
        if (!this.webSocket) {
            throw new Error('WebSocket connection not established.');
        }
        return this.webSocket;
    }

    onOpen(event: Event) {
        console.log('WebSocket connection established.');
        
        // Subscribe to the order book and trades for the specified trading symbol
        const subscribeMessage = {
            event: 'subscribe',
            pair: [this.tradingSymbol],
            subscription: {
                name: 'book',
                depth: 1000,
            },
        };
        this.getWebSocket().send(JSON.stringify(subscribeMessage));
    }

    onMessage(event: MessageEvent) {
        const msg = JSON.parse(event.data as string);

        if (!Array.isArray(msg)) {
            return;
        }

        const [channelID, data, channelName, pair] = msg;

        if (channelName.startsWith('book-')) {
            this.handleOrderBookEvent(data);
        } else if (channelName === 'trade') {
            this.handleTradeEvent(data);
        }
    }

    connect() {
        console.log(`Connecting to Kraken WebSocket feed for ${this.tradingSymbol}.`);
        this.webSocket = new WebSocket(this.webSocketUrl);
        this.webSocket.onopen = this.onOpen.bind(this);
        this.webSocket.onmessage = this.onMessage.bind(this);
        this.isConnected = true;
    }

    disconnect() {
        if (!this.isConnected) return;

        console.log('Disconnecting from Kraken WebSocket feed.');
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
            // Clear existing orders for snapshot
            this.orderBook.clearOrders();
        }
    
        (data.b ?? data.bs ?? []).forEach((bid: any) => {
            const order = processLevel(bid, orderType.BUY);
            this.orderBook.addOrder(order);
        });
    
        (data.a ?? data.as ?? []).forEach((ask: any) => {
            const order = processLevel(ask, orderType.SELL);
            this.orderBook.addOrder(order);
        });
    
        this.orderBook.matchOrders();
    
        // Trigger an update in the BookAnimation instance
        if (this.bookAnimation) {
            this.bookAnimation.update();
        }
    }
    
    processOrderBookData(data: any, key: 'b' | 'a', type: orderType) {
        const orders = data[key] ?? [];
        orders.forEach((level: any[]) => {
            const price = parseFloat(level[0]);
            const quantity = parseFloat(level[1]);
            const order = { price, quantity, orderType: type };
            this.orderBook.addOrder(order);
        });
    }

    handleTradeEvent(data: any[]) {
        data.forEach(trade => {
            const [price, volume, time, side, orderType, misc] = trade;
            console.log(`Trade executed: ${volume} at price ${price} on side ${side}`);
        });
    }
}
