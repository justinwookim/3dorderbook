import React, { useState, useEffect } from 'react';
import { BookAnimation, CameraMode } from './BookAnimation';
import { OrderBookEvent, OrderBookEventHandler } from './FeedHandler/FeedHandler';
import { Instrument, InstrumentRepository } from './instruments';
import { orderType, Order, Limit, Book } from './OrderBook';

const GUIComponent = ({ instrumentRepository, feedManager, animation, Book, initialExchange, initialSymbol }) => {
    const [expanded, setExpanded] = useState(true);
    const [currentExchange, setCurrentExchange] = useState(initialExchange);
    const [symbols, setSymbols] = useState(instrumentRepository.getExchangeInstruments(initialExchange).map(ins => ins.symbol));
    const [currentSymbol, setCurrentSymbol] = useState(initialSymbol);
    const [isCumulative, setIsCumulative] = useState(true);
    const [currentCameraMode, setCurrentCameraMode] = useState(CameraMode.Front);
    const cameraModes = [CameraMode.Front, CameraMode.XWing, CameraMode.FPS];

    useEffect(() => {
        setSymbols(instrumentRepository.getExchangeInstruments(currentExchange).map(ins => ins.symbol));
        setCurrentSymbol(symbols[0]);
    }, [currentExchange, instrumentRepository, symbols]);

    useEffect(() => {
        const instrument = instrumentRepository.getExchangeInstrument(currentExchange, currentSymbol);
        feedManager.disconnect();
        book.clear();
        animation.reset();
        animation.draw();
        animation.setTickSize(instrument.tickSize);
        feedManager.connect(currentExchange, currentSymbol);
    }, [currentExchange, currentSymbol, feedManager, instrumentRepository, animation, book]);

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
                            {instrumentRepository.getExchanges().map(exchange => (
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
