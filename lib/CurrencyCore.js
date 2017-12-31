var CurrencyCore = {};
  CurrencyCore.events = {};
  CurrencyCore.events.onAllTickerStream = ()=>{};

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
    CurrencyCore.ctrl = ctrl,
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
  
  //CurrencyCore.ctrl.UI.updateTickers(candidates);  
}

CurrencyCore.getCandidatesFromStream = (stream)=>{
  var candidates = [];
  for(i=0;i<CurrencyCore.selectors.length;i++){
    var sel = CurrencyCore.selectors[i].replace('-','');
    candidates[sel] = stream.obj[sel];
  }
  return candidates;
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
  
  if(CurrencyCore.ctrl && CurrencyCore.ctrl.storage.streamTick)
    CurrencyCore.ctrl.storage.streamTick(CurrencyCore.streams[key], key);
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
