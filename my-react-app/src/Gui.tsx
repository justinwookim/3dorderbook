import React, { useState, useEffect } from 'react';
import { OrderBookEvent, OrderBookEventHandler, BitMEXFeedHandler } from './FeedHandler/FeedHandler';
import { Instrument, InstrumentRepository } from './CombinedInstruments';
import { orderType, Order, Limit, Book } from './OrderBook';

const GUIComponent = ({ InstrumentRepository, BitMEXFeedHandler, animation, Book, initialExchange, initialSymbol }) => {
    const [expanded, setExpanded] = useState(true);
    const [currentExchange, setCurrentExchange] = useState(initialExchange);
    const [symbols, setSymbols] = useState(InstrumentRepository.getExchangeInstruments(initialExchange).map(ins => ins.symbol));
    const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
    const [isCumulative, setIsCumulative] = useState(true);
    const [currentCameraMode, setCurrentCameraMode] = useState(CameraMode.Front);
    const cameraModes = [CameraMode.Front, CameraMode.XWing, CameraMode.FPS];

    useEffect(() => {
        setSymbols(InstrumentRepository.getExchangeInstruments(currentExchange).map(ins => ins.symbol));
        setCurrentSymbol(symbols[0]);
    }, [currentExchange, InstrumentRepository, symbols]);

    useEffect(() => {
        const instrument = InstrumentRepository.getExchangeInstrument(currentExchange, currentSymbol);
        BitMEXFeedHandler.disconnect();
        Book.clear();
        animation.reset();
        animation.draw();
        animation.setTickSize(instrument.tickSize);
        BitMEXFeedHandler.connect(currentExchange, currentSymbol);
    }, [currentExchange, currentSymbol, BitMEXFeedHandler, InstrumentRepository, animation, Book]);

    useEffect(() => {
        animation.setCumulative(isCumulative);
    }, [isCumulative, animation]);

    useEffect(() => {
        animation.setCameraMode(currentCameraMode);
    }, [currentCameraMode, animation]);

    return (
        <div>
            {expanded && (
                <div>
                    <button onClick={() => setExpanded(false)}>Close</button>
                    <div>
                        <select value={currentExchange} onChange={e => setCurrentExchange(e.target.value)}>
                            {InstrumentRepository.getExchanges().map(exchange => (
                                <option key={exchange} value={exchange}>{exchange}</option>
                            ))}
                        </select>
                        <select value={currentSymbol} onChange={e => setCurrentSymbol(e.target.value)}>
                            {symbols.map(symbol => (
                                <option key={symbol} value={symbol}>{symbol}</option>
                            ))}
                        </select>
                        <div>
                            <label>
                                <input type="checkbox" checked={isCumulative} onChange={e => setIsCumulative(e.target.checked)} />
                                Cumulative
                            </label>
                        </div>
                        <div>
                            {cameraModes.map(mode => (
                                <button key={mode} onClick={() => setCurrentCameraMode(mode)}>
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {!expanded && <button onClick={() => setExpanded(true)}>Expand</button>}
        </div>
    );
};

export default GUIComponent;
