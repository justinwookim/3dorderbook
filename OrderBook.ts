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
