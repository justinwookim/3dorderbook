// Import your OrderBook class
import { OrderBook, Order, orderType } from './OrderBook'

// Initialize the order book
const orderBook = new OrderBook();

// Define some test orders
const buyOrder1: Order = { price: 100, quantity: 10, orderType: orderType.BUY };
const sellOrder1: Order = { price: 95, quantity: 5, orderType: orderType.SELL };

// Add orders to the book
orderBook.addOrder(buyOrder1);
orderBook.addOrder(sellOrder1);

// Test matching orders
orderBook.matchOrders();

// Display the current state of the book
orderBook.displayBook();

// Remove an order and display again
orderBook.removeOrder(buyOrder1);
orderBook.displayBook();

// npx tsc && node testcases.js 
// ^ this is to run the testcases in the terminal kenny, first compiles then executes js file