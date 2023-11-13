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
    entryTime : number; 
    eventTime : number; 
    nextOrder : Order; 
    prevOrder : Order; 
    // TODO: add Limit parent node
}

// class Order {
//     idNumber: number;
//     buyOrSell: boolean;
//     shares: number;
//     limit: number;
//     entryTime: number;
//     eventTime: number;
//     nextOrder: Order | null;
//     prevOrder: Order | null;
//     parentLimit: Limit | null;

//     constructor(
//         idNumber: number,
//         buyOrSell: boolean,
//         shares: number,
//         limit: number,
//         entryTime: number,
//         eventTime: number
//     ) {
//         this.idNumber = idNumber;
//         this.buyOrSell = buyOrSell;
//         this.shares = shares;
//         this.limit = limit;
//         this.entryTime = entryTime;
//         this.eventTime = eventTime;
//         this.nextOrder = null;
//         this.prevOrder = null;
//         this.parentLimit = null;
//     }


// }

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

    add(order: Order): void {
        // Add an order to the book
    }
}
