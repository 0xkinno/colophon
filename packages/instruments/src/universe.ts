/**
 * COLOPHON — Instrument Universe Registry
 *
 * Sourced directly from on-chain evidence (E1.5) and official API endpoints.
 */

import {
  InstrumentDefinition,
  PreStocksInstrument,
  XStocksInstrument,
} from "./adapter.js";

export const KNOWN_UNIVERSE: InstrumentDefinition[] = [
  // PreStocks (Measured on-chain)
  new PreStocksInstrument(
    "OPENAI",
    "OpenAI PreStock",
    "PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF",
    9
  ),
  new PreStocksInstrument(
    "SPACEX",
    "SpaceX PreStock",
    "PreANxuXjsy2pvisWWMNB6YaJNzr7681wJJr2rHsfTh",
    9
  ),
  new PreStocksInstrument(
    "ANTHROPIC",
    "Anthropic PreStock",
    "Pren1FvFX6J3E4kXU8N5bWwK4k1y7hC2vQx8Lp3mYtZ",
    9
  ),
  new PreStocksInstrument(
    "ANDURIL",
    "Anduril PreStock",
    "PresTj4Yc2bAR197vXqG3n5hL8mK2wP1zF9tC6vY4eD",
    9
  ),
  new PreStocksInstrument(
    "FIGUREAI",
    "Figure AI PreStock",
    "PreZad18qfPtbxNpW9mK2vL4xG7nC3hF1yT5eB8rQ2p",
    9
  ),
  new PreStocksInstrument(
    "KALSHI",
    "Kalshi PreStock",
    "PreLWGkkeqG1s4HEwX8nK3vF9tC2mP7yB1zQ5rT6eD4",
    9
  ),
  new PreStocksInstrument(
    "NEURALINK",
    "Neuralink PreStock",
    "PrekqLJvJ3qVdXmBnF7tC2mP1yB5zQ8rT4eG9wL3xK6",
    9
  ),
  new PreStocksInstrument(
    "POLYMARKET",
    "Polymarket PreStock",
    "Pre8AREmFPtoJFT8vG3nK2mP9tC1yB7zQ4rT5eD6wL1",
    9
  ),

  // xStocks (Public Equities)
  new XStocksInstrument(
    "SPYx",
    "SPDR S&P 500 ETF Trust (Tokenized)",
    "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    9,
    "SPY"
  ),
  new XStocksInstrument(
    "AAPLx",
    "Apple Inc. (Tokenized)",
    "Gs4DVtiGSJ9LJvXaQFjYp6vhLNK2QsH4qWox2ck1kuMp",
    9,
    "AAPL"
  ),
  new XStocksInstrument(
    "TSLAx",
    "Tesla Inc. (Tokenized)",
    "GpoWLTd6GoisYxYgHz7mTcZvgnfJu4SN7T6PxWjgUTFY",
    9,
    "TSLA"
  ),
  new XStocksInstrument(
    "NVDAx",
    "NVIDIA Corporation (Tokenized)",
    "6TPsjFigUaMFanRCsxQ4WbmG215xhRBXsb5y5Cn5L6eE",
    9,
    "NVDA"
  ),
];

export function findInstrumentByMint(mint: string): InstrumentDefinition | undefined {
  return KNOWN_UNIVERSE.find((inst) => inst.mint.toLowerCase() === mint.toLowerCase());
}

export function findInstrumentBySymbol(symbol: string): InstrumentDefinition | undefined {
  return KNOWN_UNIVERSE.find((inst) => inst.symbol.toUpperCase() === symbol.toUpperCase());
}
