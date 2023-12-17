import React, { useState, useEffect } from 'react';
import { KrakenFeedHandler } from './FeedHandler/FeedHandler';
import { Instrument, InstrumentRepository } from './CombinedInstruments';
import { orderType, Order, OrderBook} from './OrderBook';
import { CameraMode } from './Components/CameraManager';
import { BookAnimation } from './3DBookAnimation'
import './style.css'; 

const addDropDown = (InstrumentRepository: InstrumentRepository, KrakenFeedHandler:KrakenFeedHandler, animation: BookAnimation, OrderBook: OrderBook, initialSymbol: string) => {
    // const [symbols, setSymbols] = useState(InstrumentRepository.getExchangeInstruments('Kraken').map(ins => ins.symbol));
    // const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);

    // useEffect(() => {
    //     setSymbols(InstrumentRepository.getExchangeInstruments('Kraken').map(ins => ins.symbol));
    //     setCurrentSymbol(symbols[0]);
    // }, ['Kraken', InstrumentRepository, symbols]);

    // useEffect(() => {
    //     const instrument = InstrumentRepository.getExchangeInstrument('Kraken', currentSymbol);
    //     KrakenFeedHandler.disconnect();
    //     OrderBook.clearOrders();
    //     animation.draw();
    //     animation.setTickSize(instrument!.tickSize);
    //     KrakenFeedHandler.setSymbol(currentSymbol); 
    //     KrakenFeedHandler.connect();
    // }, [currentSymbol, KrakenFeedHandler, InstrumentRepository, animation, OrderBook]);
    console.log("HERE"); 
    return (
        <div id="gui">
            TESTING
            {/* {(
                <div>
                    <div>
                        <select value={currentSymbol} onChange={e => setCurrentSymbol(e.target.value)}>
                            {symbols.map(symbol => (
                                <option key={symbol} value={symbol}>{symbol}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )} */}
        </div>
    );
};

export default addDropDown;





