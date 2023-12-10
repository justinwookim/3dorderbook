import { Scene } from 'three';
import { TradeEvent } from '../FeedHandler/FeedHandler'; // Update this path to where TradeEvent is located
import { TradeIndicator } from '../TradeConfirmed'; // Update this path to where TradeIndicator is located

export class TradeManager {
    private tradeBuffer: TradeEvent[];
    private trades: TradeIndicator[][];
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
        this.tradeBuffer = [];
        this.trades = [];
    }

    addTrade(trade: TradeEvent): void {
        this.tradeBuffer.push(trade);
    }

    processTrades(): void {
        // Add new trades from the buffer to the scene
        const tradeSlice = this.tradeBuffer.map(trade => 
            new TradeIndicator(this.scene, trade.price, trade.size, trade.side, /* other parameters if needed */)
        );
        
        // Update the trades array
        this.trades.unshift(tradeSlice);
        if (this.trades.length > /* Your maximum depth */) {
            const oldTrades = this.trades.pop();
            oldTrades?.forEach(tradeIndicator => tradeIndicator.destroy());
        }

        // Clear the trade buffer
        this.tradeBuffer = [];
    }

    // Method to update trade indicators, if needed
    updateTrades(/* parameters if needed */): void {
        // Implementation for updating trades
    }

    // Additional methods for trade management, like resetting trades, etc., can be added here
}



// 1. The constructor initializes the trade buffer and an array to store `TradeIndicator` objects. The scene is passed in the constructor and stored for adding `TradeIndicator` objects to it.
// 2. The `addTrade` method is used to add new trades to the buffer.
// 3. The `processTrades` method processes the trades in the buffer, creates new `TradeIndicator` instances, and adds them to the scene. It also manages the lifecycle of these instances, ensuring that old instances are properly removed and disposed of to prevent memory leaks.
// 4. The `updateTrades` method is a placeholder for any logic needed to update the trades over time, such as animations or state changes.

// You'll need to adjust the import paths for `TradeEvent` and `TradeIndicator` based on your project's structure.

// When integrating `TradeManager` into your main application, you'll create an instance of this class and use its methods to manage all trade-related operations. This approach will simplify your main code and isolate the trade management logic, making it more maintainable and scalable.