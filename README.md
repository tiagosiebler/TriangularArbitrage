# Triangular Arbitrage - Binance

- Monitor multiple currencies in a single exchange via websockets. 
- Attempt to automatically detect triangular arbitrage opportunities.

## Setup


```
git clone https://github.com/tiagosiebler/BinanceTriangularArbitrage.git
cd BinanceTriangularArbitrage
npm install
```

## Configuration

### API Credentials

- Rename/copy the template file to .keys:
```
cp .keys-template .keys
```

- Edit .keys with your Binance API credentials.

### Misc Settings

See `conf.ini`

## Usage

```
npm start
```

The result of this is a live stream from a number of pairs:
```
Top Potential Arbitrage Triplets, via ETH                                                                                                                                                                        
                                                                                                                                                                                                                 
Step A    Step B    Step C    Rate                                                                                                                                                                               
BTC       ETH       MTL       5.284%                                                                                                                                                                             
BTC       ETH       DLT       3.390%                                                                                                                                                                             
BTC       ETH       ARK       2.643%                                                                                                                                                                             
BTC       ETH       BAT       1.453%                                                                                                                                                                             
BTC       ETH       SUB       1.302%                                                                                                                                                                             
BTC       ETH       BQX       0.958%                                                                                                                                                                             
BTC       ETH       STRAT     0.809%                                                                                                                                                                             
BTC       ETH       RCN       0.773%                                                                                                                                                                             
BTC       ETH       WTC       0.719%                                                                                                                                                                             
BTC       ETH       FUEL      0.694%                                                                                                                                                                             
BTC       ETH       ELF       0.664%                                                                                                                                                                             
BTC       ETH       VEN       0.624%                                                                                                                                                                             
BTC       ETH       DNT       0.571%                                                                                                                                                                             
BTC       ETH       GTO       0.568%                                                                                                                                                                             
BTC       ETH       WAVES     0.567%                                                                                                                                                                             
BTC       ETH       ARN       0.547%                                                                                                                                                                             
BTC       ETH       REQ       0.538%                                                                                                                                                                             
BTC       ETH       KNC       0.496%                                                                                                                                                                             
BTC       ETH       NEO       0.460%                                                                                                                                                                             
BTC       ETH       TNT       0.442%                                                                                                                                                                             
BTC       ETH       ADA       0.414%                                                                                                                                                                             
BTC       ETH       WABI      0.346%                                                                                                                                                                             
BTC       ETH       AST       0.342%                                                                                                                                                                             
BTC       ETH       POE       0.290%                                                                                                                                                                             
BTC       ETH       BTG       0.250%                                                                                                                                                                             
BTC       ETH       XLM       0.246%                                                                                                                                                                             
BTC       ETH       GXS       0.243%                                                                                                                                                                             
BTC       ETH       ETC       0.241%                                                                                                                                                                             
BTC       ETH       LEND      0.212%                                                                                                                                                                             
BTC       ETH       LRC       0.203%                                                                                                                                                                             
BTC       ETH       ZEC       0.164%                                                                                                                                                                             
BTC       ETH       QTUM      0.162%                                                                                                                                                                             
BTC       ETH       ENG       0.156%                                                                                                                                                                             
BTC       ETH       USDT      0.137%                                                                                                                                                                             
BTC       ETH       TRX       0.124%                                                                                                                                                                             
BTC       ETH       PPT       0.122%                                                                                                                                                                             
BTC       ETH       ENJ       0.085%                                                                                                                                                                             
BTC       ETH       BNB       0.051%                                                                                                                                                                             
BTC       ETH       BCC       0.045%                                                                                                                                                                             
BTC       ETH       XVG       0.026%                         
```

## Debugging

- In Google Chrome, open the URL: 
```
chrome://inspect/#devices
```
- Click 'Open dedicated DevTools for Node'.
- Start node with --inspect:
```
node --inspect index.js
```
