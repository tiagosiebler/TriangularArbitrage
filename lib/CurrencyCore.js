var CurrencyCore = {};
  CurrencyCore.events = {};
  CurrencyCore.events.onAllTickerStream = ()=>{},
  controller = {};

// constructor
CurrencyCore.init = (selectors, exchange, ctrl) => {
  if(!selectors) 
    throw "No selectors provided when loading CurrencyCore. Ensure enabledPairs is set in conf.ini!";
    
  if(!exchange) 
    throw "Undefined exchange connector. May not be able to communicate with exchange";
  
  // Stores
  CurrencyCore.selectors = selectors.split(','),
    CurrencyCore.currencies = {}, 
    CurrencyCore.sockets = {},
    CurrencyCore.streams = {},
    controller = ctrl,
    CurrencyCore.steps = ['BTC','ETH','BNB','USDT'];

  //CurrencyCore.startWSockets(exchange, ctrl);
  CurrencyCore.startAllTickerStream(exchange, ctrl);
  CurrencyCore.queueTicker(5000);
  
  return CurrencyCore;
};

CurrencyCore.queueTicker = (interval)=>{
  if(!interval) interval = 3000;
  setTimeout(()=>{ 
    CurrencyCore.queueTicker(interval);
  }, interval);
  CurrencyCore.tick();
}

CurrencyCore.tick = ()=>{

  //debugger;
  
  //controller.UI.updateTickers(candidates);  
}

async function filter(arr, callback) {
	return (await Promise.all(arr.map(async item => {
		 return (await callback(item)) ? item : undefined
	}))).filter(i=>i!==undefined)
}

// return all array elements where the currency starts or ends with X (e.g key = BTC)
CurrencyCore.filterByKey = async (arr, key)=>{
  return await filter(arr, async a => a.s.startsWith(key.toUpperCase()) || a.s.endsWith(key.toUpperCase()));
}

CurrencyCore.getCandidatesFromStream = (stream)=>{
  var candidates = [];
  for(i=0;i<CurrencyCore.selectors.length;i++){
    var sel = CurrencyCore.selectors[i].replace('-','');
    candidates[sel] = stream.obj[sel];
  }
  return candidates;
}

CurrencyCore.getDynamicCandidatesFromStream = async (stream)=>{
  var candidates = {};
  var promises = [];
  var keys = {};
      keys.c = 'usdt';
  
  // all currencies we can go to from btc
  /*
  promises.push(CurrencyCore.filterByKey(stream.arr, 'btc'))
  promises.push(CurrencyCore.filterByKey(stream.arr, 'eth'))
  var steps = await Promise.all(promises);//*/
  
  candidates.c = await CurrencyCore.filterByKey(stream.arr, keys.c);
  
  for(i=0;i<candidates.c.length;i++){
    //BTCUSDT
    var cCandidate = candidates.c[i];
    
    //BTC
    keys.a = cCandidate.s.replace(keys.c.toUpperCase(), '');

    //find all pairs that support BTC?
    candidates.a = await CurrencyCore.filterByKey(stream.arr, keys.a);
    
    //
    debugger;
  }
  
  //debugger;
  /*
  for(i=0;i<CurrencyCore.selectors.length;i++){
    var sel = CurrencyCore.selectors[i].replace('-','');
    candidates[sel] = stream.obj[sel];
  }*/
  //return candidates;
}

CurrencyCore.checkArbitrage = (stream, candidates)=>{
  if(!stream || !candidates) return;
  //EURUSD * (1/GBPUSD) * (1/EURGBP) = 1 

  //start btc
  //via xUSDT
  //end btc
  
  var a = candidates['BTCUSDT'];
  var b = candidates['ETHUSDT'];
  var c = candidates['ETHBTC'];
  
  if(!a || !b || !c) return;
  
  //btcusd : (flip/usdEth) : ethbtc
  var d = (a.b) * (1/b.b) * (c.b);
  debugger;
}

// Fires once per second, with  all ticker data from Binance
CurrencyCore.events.onAllTickerStream = stream =>{
  var key = 'allMarketTickers';
  
  // Basic array from api arr[0].s = ETHBTC
  CurrencyCore.streams.allMarketTickers.arr = stream;
  
  // Mapped object arr[ETHBTC]
  CurrencyCore.streams.allMarketTickers.obj = stream.reduce(function ( array, current ) {
      array[ current.s ] = current;
      return array;
  }, {});

  // Sub objects with only data on specific markets
  for(i=0;i<CurrencyCore.steps.length;i++)
    CurrencyCore.streams.allMarketTickers.markets[CurrencyCore.steps[i]] = stream.filter(e => e.s.endsWith(CurrencyCore.steps[i]));
  
  if(controller && controller.storage.streamTick)
    controller.storage.streamTick(CurrencyCore.streams[key], key);
};







// starts one global stream for all selectors. Stream feeds back info every second:
// https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md#all-market-tickers-stream
CurrencyCore.startAllTickerStream = function(exchange, ctrl){
  if(!CurrencyCore.streams.allMarketTickers){
    CurrencyCore.streams.allMarketTickers = {};
    CurrencyCore.streams.allMarketTickers.arr = [],
    CurrencyCore.streams.allMarketTickers.obj = {};
    CurrencyCore.streams.allMarketTickers.markets = [];
  }

  CurrencyCore.sockets.allMarketTickerStream = exchange.WS.onAllTickerStream(CurrencyCore.events.onAllTickerStream);
}

// starts streams for specific selectors
CurrencyCore.startWSockets = function(exchange, ctrl){
  
  // loop through provided csv selectors, and initiate trades & orderBook sockets for each
  for(i = 0;i < CurrencyCore.selectors.length;i++){
    
    let selector = require('./CurrencySelector.js')(CurrencyCore.selectors[i], exchange);
    
    CurrencyCore.currencies[selector.key] = selector;
    CurrencyCore.currencies[selector.key].handleEvent = ctrl.events.wsEvent;
    CurrencyCore.currencies[selector.key].startWSockets(ctrl.events);
  }
}


module.exports = CurrencyCore.init;
