import { InstrumentRepository } from '../CombinedInstruments';
import { orderType, OrderBook} from '../OrderBook';

export type OrderBookEventHandler = (event: OrderBookEvent) => void;
export type TradeEventHandler = (event: TradeEvent) => void;

export interface OrderBookEvent {
    action: OrderBookAction,
    bids: PriceLevel[],
    asks: PriceLevel[]
}

export interface TradeEvent {
    price: number,
    size: number,
    orderType: orderType
}

export class BitMEXFeedHandler {
    private webSocket: WebSocket | undefined;
    private readonly webSocketUrl: string = 'wss://ws.bitmex.com/realtime';
    private isConnected: boolean = false;
    private orderBookEventHandlers: OrderBookEventHandler[] = [];
    private tradeEventHandlers: TradeEventHandler[] = [];
    private tradingSymbol: string = '';
    // private instrumentRepo = new InstrumentRepository();

    private getWebSocket(): WebSocket {
        if (!this.webSocket) {
            throw new Error('WebSocket connection not established.');
        }
        return this.webSocket;
    }
    
    onOpen(): void {
        this.getWebSocket().send(JSON.stringify({
            'op': 'subscribe', 
            'args': [`orderBookL2:${this.tradingSymbol}`, `trade:${this.tradingSymbol}`]
        }));
    }

    onMessage(event: MessageEvent): void {
        const data = JSON.parse(event.data);
        if (data.table === 'orderBookL2') {
            this.processOrderBookData(data);
        } else if (data.table === 'trade') {
            this.processTradeData(data);
        }
    }

    onOrderBookEvent(handler: OrderBookEventHandler): void {
        this.orderBookEventHandlers.push(handler);
    }

    onTradeEvent(handler: TradeEventHandler): void {
        this.tradeEventHandlers.push(handler);
    }

    connect(symbol: string): void {
        console.log(`Connecting to BitMEX WebSocket feed.`);
        this.webSocket = new WebSocket(this.webSocketUrl);
        this.tradingSymbol = symbol;
        this.webSocket.onopen = () => this.onOpen();
        this.webSocket.onmessage = (e: MessageEvent) => {
            if (!this.isConnected) return;
            this.onMessage(e);
        };
        this.isConnected = true;
    }

    disconnect(): void {
        if (!this.isConnected) return;
        console.log(`Disconnecting from BitMEX WebSocket feed.`);
        this.getWebSocket().close();
        this.webSocket = undefined;
        this.isConnected = false;
    }

    private processOrderBookData(data: any): void {
        const processedBids: PriceLevel[] = [];
        const processedAsks: PriceLevel[] = [];

        data.data.forEach((level: any) => {
            const priceLevel: PriceLevel = {
                price: level.price,
                size: level.size,
                orderType: level.orderType === 'BUY' ? orderType.BUY : orderType.SELL
            };

            if (priceLevel.orderType === orderType.BUY) {
                processedBids.push(priceLevel);
            } else {
                processedAsks.push(priceLevel);
            }
        });

        const event: OrderBookEvent = {
            action: data.action === 'partial' ? OrderBookAction.Partial : OrderBookAction.Update,
            bids: processedBids,
            asks: processedAsks
        };

        this.publishOrderBookEvent(event);
    }

    private processTradeData(data: any): void {
        data.data.forEach((tradeData: any) => {
            const trade: TradeEvent = {
                price: tradeData.price,
                size: tradeData.size,
                orderType: tradeData.orderType === 'BUY' ? orderType.BUY : orderType.SELL
            };
            this.publishTradeEvent(trade);
        });
    }

    private publishOrderBookEvent(event: OrderBookEvent): void {
        this.orderBookEventHandlers.forEach(handler => handler(event));
    }

    private publishTradeEvent(event: TradeEvent): void {
        this.tradeEventHandlers.forEach(handler => handler(event));
    }
}
