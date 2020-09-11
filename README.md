<!-- [![Build Status](https://travis-ci.org/tiagosiebler/TriangularArbitrage.svg?branch=master)](https://travis-ci.org/tiagosiebler/TriangularArbitrage) -->

# Triangular Arbitrage - Binance

- Monitor multiple currencies in a single exchange via websockets.
- Calculate rate for all possible triangular ab -> bc -> ca paths, via live bid quote.
- Calculate and subtract fees from rate.
- Sort and display top opportunities in descending order.
- Store historic opportunity information in DB, for later aggregation & analytics.

# Contributions
My focus is currently not on further developing this project, but I will review pull requests. If you'd like to help, pull requests are openly welcome.

# Contributions & Thanks
If you found this project interesting or useful, create accounts with my referral links:
- [Bybit](https://www.bybit.com/en-US/register?affiliate_id=9410&language=en-US&group_id=0&group_type=1)
- [Binance](https://www.binance.com/en/register?ref=20983262)

Or buy me coffee using any of these:
- BTC: `1C6GWZL1XW3jrjpPTS863XtZiXL1aTK7Jk`
- ETH (ERC20): `0xd773d8e6a50758e1ada699bb6c4f98bb4abf82da`

## Setup

#### Install Dependencies
- [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) (optional)
- [Node.js](https://nodejs.org/) 8 or Higher

#### Clone & Install Repo

```
git clone https://github.com/tiagosiebler/TriangularArbitrage.git
cd TriangularArbitrage
npm install
```

## Configuration

### Misc Settings

See `conf.ini`

## Usage
```
npm start
```

The result of this is a live stream from a number of pairs:
```
Top Potential Arbitrage Triplets, via: BNB,ETH,USDT

Step A    Step B    Step C    Rate      Fees BnB  (Rate - BnB Fee)    Fees Normal      (Rate - Fee)
BTC       BNB       GTO       10.420%   0.521%    9.899%              1.042%           9.378%
BTC       BNB       WAVES     2.558%    0.128%    2.430%              0.256%           2.302%
BTC       BNB       OST       1.536%    0.077%    1.459%              0.154%           1.382%
BTC       BNB       BRD       1.006%    0.050%    0.956%              0.101%           0.905%
BTC       BNB       BCPT      0.946%    0.047%    0.898%              0.095%           0.851%
BTC       ETH       EOS       0.663%    0.033%    0.630%              0.066%           0.596%
BTC       ETH       DLT       0.638%    0.032%    0.606%              0.064%           0.574%
BTC       BNB       WABI      0.633%    0.032%    0.601%              0.063%           0.569%
BTC       BNB       DLT       0.629%    0.031%    0.597%              0.063%           0.566%
BTC       ETH       MANA      0.553%    0.028%    0.525%              0.055%           0.497%
BTC       ETH       AMB       0.540%    0.027%    0.513%              0.054%           0.486%
BTC       BNB       LSK       0.540%    0.027%    0.513%              0.054%           0.486%
BTC       BNB       NEO       0.525%    0.026%    0.499%              0.053%           0.473%
BTC       ETH       BTG       0.522%    0.026%    0.496%              0.052%           0.470%
BTC       ETH       POWR      0.502%    0.025%    0.477%              0.050%           0.452%
BTC       ETH       CDT       0.487%    0.024%    0.462%              0.049%           0.438%
BTC       ETH       LEND      0.427%    0.021%    0.406%              0.043%           0.384%
BTC       USDT      LTC       0.402%    0.020%    0.382%              0.040%           0.362%
BTC       ETH       DGD       0.396%    0.020%    0.377%              0.040%           0.357%
BTC       ETH       MTL       0.382%    0.019%    0.363%              0.038%           0.344%
BTC       BNB       AION      0.361%    0.018%    0.343%              0.036%           0.325%
BTC       ETH       LTC       0.356%    0.018%    0.338%              0.036%           0.320%
BTC       BNB       POWR      0.356%    0.018%    0.338%              0.036%           0.320%
BTC       ETH       XMR       0.327%    0.016%    0.311%              0.033%           0.294%
BTC       USDT      NEO       0.295%    0.015%    0.281%              0.030%           0.266%
BTC       ETH       SALT      0.287%    0.014%    0.273%              0.029%           0.258%
BTC       BNB       XZC       0.285%    0.014%    0.271%              0.028%           0.256%
BTC       ETH       QTUM      0.250%    0.012%    0.237%              0.025%           0.225%
BTC       ETH       BAT       0.237%    0.012%    0.225%              0.024%           0.213%
BTC       ETH       FUN       0.236%    0.012%    0.224%              0.024%           0.212%
BTC       ETH       DASH      0.232%    0.012%    0.220%              0.023%           0.209%
BTC       ETH       OMG       0.228%    0.011%    0.216%              0.023%           0.205%
BTC       ETH       BCPT      0.223%    0.011%    0.212%              0.022%           0.201%
BTC       ETH       LSK       0.207%    0.010%    0.197%              0.021%           0.186%
BTC       ETH       ADX       0.206%    0.010%    0.196%              0.021%           0.186%
BTC       ETH       GTO       0.191%    0.010%    0.182%              0.019%           0.172%
BTC       USDT      BCC       0.169%    0.008%    0.161%              0.017%           0.152%
BTC       USDT      ETH       0.161%    0.008%    0.153%              0.016%           0.145%
BTC       ETH       CMT       0.159%    0.008%    0.151%              0.016%           0.143%
```

## Docker Setup

#### Install Dependencies

- [Docker](https://www.docker.com/community-edition#/download) Tested on version 1.13.1
- [Docker Compose](https://docs.docker.com/compose/install/) Tested on version 1.8.0

#### Clone repo
```
git clone https://github.com/tiagosiebler/TriangularArbitrage.git
cd TriangularArbitrage
```

#### Usage
If you are running for the first time or when you have made no changes to code or config
```
docker-compose up
```

If you have made any config or code changes
```
docker-compose kill
docker-compose build
docker-compose up
```