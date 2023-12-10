export enum orderType {
    BUY, 
    SELL, 
    // TODO: add more order types as needed   
}

export class Order {
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
export class Limit {
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

export class Book {
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
        // TODO: implement addOrder to add Orders into the doubly linked list
    }
    matchOrder(): void {
        // TODO: implement matchOrder to check for trades
    }
}

// TODO: use the APIs previously mentioned to retrieve real market data. :)
