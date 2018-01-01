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
                                                                                             
Step A    Step B    Step C    Rate      Fees BnB  (Rate - BnB Fee)    Fees Normal      (Rate - Fee)                                                                                                              
BTC       ETH       MTL       6.251%    0.313%    5.938%              0.625%           5.626%
BTC       ETH       ARN       1.886%    0.094%    1.792%              0.189%           1.697%
BTC       ETH       POWR      1.753%    0.088%    1.665%              0.175%           1.577%
BTC       ETH       OMG       0.859%    0.043%    0.816%              0.086%           0.773%
BTC       ETH       TRIG      0.592%    0.030%    0.563%              0.059%           0.533%
BTC       ETH       BCC       0.591%    0.030%    0.562%              0.059%           0.532%
BTC       ETH       QTUM      0.538%    0.027%    0.511%              0.054%           0.485%
BTC       ETH       MOD       0.492%    0.025%    0.467%              0.049%           0.442%
BTC       ETH       LTC       0.473%    0.024%    0.449%              0.047%           0.425%
BTC       ETH       AST       0.437%    0.022%    0.415%              0.044%           0.394%
BTC       ETH       TNB       0.435%    0.022%    0.413%              0.043%           0.391%
BTC       ETH       XVG       0.396%    0.020%    0.377%              0.040%           0.357%
BTC       ETH       ETC       0.373%    0.019%    0.355%              0.037%           0.336%
BTC       ETH       WAVES     0.352%    0.018%    0.335%              0.035%           0.317%
BTC       ETH       RDN       0.346%    0.017%    0.328%              0.035%           0.311%
BTC       ETH       DNT       0.340%    0.017%    0.323%              0.034%           0.306%
BTC       ETH       SNT       0.308%    0.015%    0.293%              0.031%           0.278%
BTC       ETH       XRP       0.280%    0.014%    0.266%              0.028%           0.252%
BTC       ETH       MANA      0.202%    0.010%    0.192%              0.020%           0.182%
BTC       ETH       ZEC       0.195%    0.010%    0.186%              0.020%           0.176%
BTC       ETH       IOTA      0.193%    0.010%    0.184%              0.019%           0.174%
BTC       ETH       SALT      0.176%    0.009%    0.167%              0.018%           0.158%
BTC       USDT      ETH       0.172%    0.009%    0.163%              0.017%           0.155%
BTC       ETH       LRC       0.150%    0.008%    0.143%              0.015%           0.135%
BTC       ETH       ADA       0.146%    0.007%    0.138%              0.015%           0.131%
BTC       ETH       BTS       0.139%    0.007%    0.132%              0.014%           0.125%
BTC       ETH       WABI      0.138%    0.007%    0.131%              0.014%           0.124%
BTC       ETH       CMT       0.093%    0.005%    0.088%              0.009%           0.083%
BTC       ETH       LINK      0.090%    0.005%    0.086%              0.009%           0.081%
BTC       ETH       TRX       0.072%    0.004%    0.069%              0.007%           0.065%
BTC       ETH       GVT       0.029%    0.001%    0.027%              0.003%           0.026%
BTC       ETH       BCD       0.028%    0.001%    0.026%              0.003%           0.025%
BTC       ETH       CTR       0.027%    0.001%    0.026%              0.003%           0.025%
BTC       ETH       XLM       0.014%    0.001%    0.013%              0.001%           0.012%
BTC       ETH       HSR       0.010%    0.001%    0.010%              0.001%           0.009%
BTC       ETH       POE       0.003%    0.000%    0.003%              0.000%           0.003%
BTC       ETH       DASH      -0.133%   -0.007%   -0.126%             -0.013%          -0.120%
BTC       ETH       USDT      -0.172%   -0.009%   -0.163%             -0.017%          -0.155%
BTC       ETH       CDT       -0.204%   -0.010%   -0.194%             -0.020%          -0.184%
BTC       ETH       REQ       -0.261%   -0.013%   -0.248%             -0.026%          -0.235% 
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
