// CombinedInstruments.ts
import * as fs from 'fs';

// Define the Instrument interface
export interface Instrument {
  symbol: string;
  tickSize: number;
}

// Define the InstrumentRepository class
export class InstrumentRepository {
  private _lookup: Map<string, Instrument[]> = new Map();

  constructor(instruments: { [key: string]: Instrument[] }) {
    for (const exchange of Object.keys(instruments)) {
      this._lookup.set(exchange, instruments[exchange]);
    }
  }

  getExchanges(): string[] {
    return [...this._lookup.keys()];
  }

  getExchangeInstruments(exchange: string): Instrument[] {
    return this._lookup.get(exchange) || [];
  }

  getExchangeInstrument(exchange: string, symbol: string): Instrument | null {
    const symbols = this.getExchangeInstruments(exchange);
    return symbols.find((ins) => ins.symbol === symbol) || null;
  }
  
}

// Define the function to fetch BitMEX instruments
export async function fetchBitMEXInstruments(): Promise<Instrument[]> {
  console.log('Fetching BitMEX instruments...');
  const response = await fetch('https://www.bitmex.com/api/v1/instrument/active');
  const json = await response.json();
  return json.map((x: any) => ({
    symbol: x.symbol,
    tickSize: x.tickSize,
  }));
}

// Optionally, define a function to initialize the InstrumentRepository
// with fetched data and save to a file
export async function initializeAndSaveInstruments() {
  const instruments = await fetchBitMEXInstruments();
  const instrumentData = { 'BitMEX': instruments };
  const instrumentRepo = new InstrumentRepository(instrumentData);
  
  fs.writeFileSync('src/instruments.json', JSON.stringify(instrumentData, null, 2));
  return instrumentRepo;
}

// You can now use this file in your React project to manage and fetch instruments.
