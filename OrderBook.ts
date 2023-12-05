enum orderType {
    BUY, 
    SELL, 
    // TODO: add more order types as needed   
}

class Order {
    idNumber : number; 
    currentOrder : orderType; 
    shares : number; 
    limit : number; 
    entryTime : Date; 
    eventTime : Date; 
    nextOrder : Order | null; 
    prevOrder : Order | null; 
    parentLimit: Limit | null; 

    constructor(
        idNumber : number,
        currentOrder : orderType, 
        shares : number, 
        limit : number, 
        entryTime : Date,  
        eventTime : Date, 
        nextOrder : Order | null, 
        prevOrder : Order | null, 
        parentLimit: Limit | null, 
    ) {
        this.idNumber = idNumber;
        this.currentOrder = currentOrder; 
        this.shares = shares; 
        this.limit = limit; 
        this.entryTime = entryTime; 
        this.eventTime = eventTime; 
        this.nextOrder = nextOrder; 
        this.prevOrder = prevOrder; 
        this.parentLimit = parentLimit;
    }
}
class Limit {
    limitPrice: number;
    size: number;
    totalVolume: number;
    parent: Limit | null;
    leftChild: Limit | null;
    rightChild: Limit | null;
    headOrder: Order | null;
    tailOrder: Order | null;

    constructor(limitPrice: number) {
        this.limitPrice = limitPrice;
        this.size = 0;
        this.totalVolume = 0;
        this.parent = null;
        this.leftChild = null;
        this.rightChild = null;
        this.headOrder = null;
        this.tailOrder = null;
    }
}

class Book {
    buyTree: Limit | null;
    sellTree: Limit | null;
    lowestSell: Limit | null;
    highestBuy: Limit | null;

    constructor() {
        this.buyTree = null;
        this.sellTree = null;
        this.lowestSell = null;
        this.highestBuy = null;
    }

    addOrder(order: Order): void {
        let tree = (order.currentOrder === orderType.BUY) ? this.buyTree : this.sellTree;

        // Find or create the limit node
        let limitNode = this.findOrCreateLimitNode(tree, order.limit);

        // Add the order to the limit node's linked list
        this.insertOrderToLimitNode(limitNode, order);

        // Update highestBuy or lowestSell if necessary
        if (order.currentOrder === orderType.BUY && (this.highestBuy === null || order.limit > this.highestBuy.limitPrice)) {
            this.highestBuy = limitNode;
        } else if (order.currentOrder === orderType.SELL && (this.lowestSell === null || order.limit < this.lowestSell.limitPrice)) {
            this.lowestSell = limitNode;
        }
    }

    findOrCreateLimitNode(treeRoot: Limit | null, limitPrice: number): Limit {
        if (!treeRoot) {
            return new Limit(limitPrice);
        }
    
        if (limitPrice < treeRoot.limitPrice) {
            if (!treeRoot.leftChild) {
                treeRoot.leftChild = new Limit(limitPrice);
                return treeRoot.leftChild;
            } else {
                return this.findOrCreateLimitNode(treeRoot.leftChild, limitPrice);
            }
        } else if (limitPrice > treeRoot.limitPrice) {
            if (!treeRoot.rightChild) {
                treeRoot.rightChild = new Limit(limitPrice);
                return treeRoot.rightChild;
            } else {
                return this.findOrCreateLimitNode(treeRoot.rightChild, limitPrice);
            }
        } else {
            return treeRoot;
        }
    }

    insertOrderToLimitNode(limitNode: Limit, order: Order): void {
        if (!limitNode.headOrder) {
            limitNode.headOrder = limitNode.tailOrder = order;
        } else {
            limitNode.tailOrder.nextOrder = order;
            order.prevOrder = limitNode.tailOrder;
            limitNode.tailOrder = order;
        }
        // Update the size and total volume of the limit node
        limitNode.size++;
        limitNode.totalVolume += order.shares;
    }

    matchOrder(): void {
        // TODO: implement matchOrder to check for trades
    }
}

// TODO: use the APIs previously mentioned to retrieve real market data. :)
