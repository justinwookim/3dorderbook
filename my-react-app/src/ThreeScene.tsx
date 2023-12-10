import React, { useEffect } from 'react';
import Stats from 'three/examples/jsm/libs/stats.module';
import { OrderType, Order, Limit, Book } from 'my-react-app/src/OrderBook.ts';
import { OrderBookEvent, TradeEvent } from './FeedHandler/FeedHandler.ts';
import { FeedManager } from './FeedManager';
import { InstrumentRepository } from './instruments';
import { Clock, Color, Fog, HemisphereLight, PerspectiveCamera, PointLight, Scene, WebGLRenderer } from 'three';

const ThreeScene = () => {
    useEffect(() => {
        const UPDATE_PERIOD_MS = 50;
        const INITIAL_EXCHANGE = 'BitMEX';
        const INITIAL_SYMBOL = 'XBTUSD';
        const MAX_DEPTH = 400;
        const NUM_TICKS_PER_SIDE = 200;

        const clock = new Clock();
        const scene = new Scene();
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const instrumentRepository = new InstrumentRepository();
        const book = new L2Book();
        const feedManager = new FeedManager();

        const renderer = new WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const initialInstrument = instrumentRepository.getExchangeInstrument(INITIAL_EXCHANGE, INITIAL_SYMBOL);
        const animation = new BookAnimation(scene, renderer, camera, book, NUM_TICKS_PER_SIDE, MAX_DEPTH);
        animation.setTickSize(initialInstrument.tickSize);
        animation.create();

        feedManager.connect(INITIAL_EXCHANGE, INITIAL_SYMBOL);

        const ambient = new HemisphereLight(0x999999);
        scene.add(ambient);

        const light = new PointLight(0x999999, 1.1);
        light.position.set(0, 100, -100);
        scene.add(light);

        const backgroundColor = new Color(0x222222);
        scene.background = backgroundColor;
        scene.fog = new Fog(backgroundColor, 0.9 * MAX_DEPTH, MAX_DEPTH);

        const stats = Stats();

        feedManager.onTradeEvent((trade: TradeEvent) => {
            animation.addTrade(trade);
        });

        feedManager.onOrderBookEvent((event: OrderBookEvent) => {
            book.applyOrderBookEvent(event);
        });

        setInterval(() => {
            animation.update();
        }, UPDATE_PERIOD_MS);

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onWindowResize, false);

        const animate = () => {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            animation.updateCamera(delta);
            stats.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            // Cleanup
            window.removeEventListener('resize', onWindowResize);
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div id="gui"></div>
    );
};

export default ThreeScene;
