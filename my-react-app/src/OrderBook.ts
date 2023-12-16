export enum orderType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export interface Order {
    price: number;
    quantity: number;
    orderType: orderType;
}

export class OrderBook {
    private buyOrders: Order[];
    private sellOrders: Order[];

    constructor() {
        this.buyOrders = [];
        this.sellOrders = [];
    }

    addOrder(order: Order) {
        const orderList = order.orderType === 'BUY' ? this.buyOrders : this.sellOrders;
        orderList.push(order);
        this.sortOrders(orderList, order.orderType);
    }

    removeOrder(order: Order) {
        const orderList = order.orderType === 'BUY' ? this.buyOrders : this.sellOrders;
        const index = orderList.findIndex(o => o.price === order.price && o.quantity === order.quantity);
        if (index > -1) {
            orderList.splice(index, 1);
        }
    }

    matchOrders() {
        while (this.buyOrders.length > 0 && this.sellOrders.length > 0 && this.buyOrders[0].price >= this.sellOrders[0].price) {
            const buyOrder = this.buyOrders[0];
            const sellOrder = this.sellOrders[0];

            // Determine the trade quantity
            const tradeQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);

            // Adjust quantities
            buyOrder.quantity -= tradeQuantity;
            sellOrder.quantity -= tradeQuantity;

            // Remove the order from the list if its quantity becomes 0
            if (buyOrder.quantity === 0) this.buyOrders.shift();
            if (sellOrder.quantity === 0) this.sellOrders.shift();

            // console.log(`Trade executed: ${tradeQuantity} at price ${buyOrder.price}`);
        }
    }

    getBuyOrders() {
        return this.buyOrders; 
    }

    getSellOrders() {
        return this.sellOrders;
    }

    // for debugging the data 
    displayBook() {
        console.log("Buy Orders:");
        this.buyOrders.forEach(o => console.log(`Price: ${o.price}, Quantity: ${o.quantity}`));
        console.log("Sell Orders:");
        this.sellOrders.forEach(o => console.log(`Price: ${o.price}, Quantity: ${o.quantity}`));
    }

    private sortOrders(orders: Order[], orderType: 'BUY' | 'SELL') {
        orders.sort((a, b) => orderType === 'BUY' ? b.price - a.price : a.price - b.price);
    }

    // Add this method to the OrderBook class
    clearOrders() {
        this.buyOrders = [];
        this.sellOrders = [];
    }

}

