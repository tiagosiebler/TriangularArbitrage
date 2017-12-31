# Config brainstorm
Define the pairs to trade with

```//If you like to trade every paid
ALL_trading_enabled = true

//If you like to trade predefined pairs only
ALL_enabled_pairs= BTC-ETH, BTC-LTC, BTC-BCC, BTC-NEO, BTC-DASH, BTC-ADA, BTC-QTUM, BTC-TRIG, BTC-PAY, BTC-XEM, BTC-STEEM, BTC-SYS, BTC-XRP, BTC-STRAT, BTC-OMG, BTC-WAVES,  BTC-SC, BTC-GAME, BTC-LMC, BTC-1ST, BTC-EXP, BTC-PPC, BTC-POT, BTC-DCR, BTC-ZEN, BTC-XCP, BTC-CVC, ETH-etc.
```
Define the max amount to trade with
```
//Example for max cost
ALL_max_cost = 0.010

//Define the minimum volume for each pair
ALL_min_buy_volume = 200

//Define minimum buy price
ALL_min_buy_price = 0.00000500

//Define max trading pairs
ALL_max_trading_pairs = 50

//Define minimum profit in procentage
ALL_min_profit = .7
```
NOTE: minimum profit should be calculated under these norms;
- Calculate the fee price for the buy with coin A to B 
- Calculate the fee price for the sell with coin B to C (or back to A)
- (optional) Calculate the fee price for the sell with coin C to A

- Calculate the price difference between the orderbook (high prices) between all coins (A-B-A or A-B-C-A)

All costs minus the potential payout should be higher than the minimum profit otherwise no trade should be made.


```
//Feature for panic sell if the price is getting to high 
ALL_panic_sell_enabled = false
```