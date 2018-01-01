var CurrencyCore = {};

CurrencyCore.events = {};
CurrencyCore.events.onAllTickerStream = ()=>{},
controller = {};

// constructor
CurrencyCore.init = (exchange, ctrl) => {
  if(!exchange) 
    throw "Undefined exchange connector. May not be able to communicate with exchange";
  
  // Stores
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

CurrencyCore.getCurrencyFromStream = (stream, fromCur, toCur)=>{
  if(!stream || !fromCur || !toCur) return;
    
  var currency = stream.obj[fromCur + toCur];
  if(currency){
    currency.flipped = false;
    currency.rate = currency.b;
  }else{
    currency = stream.obj[toCur + fromCur];
    if(!currency){
      return false;
    }
    currency.flipped = true;
    currency.rate = (1/currency.b);
  }
  
  return currency;
}
CurrencyCore.getArbitageRate = (stream, step1, step2, step3)=>{
  if(!stream || !step1 || !step2 || !step3) return;
    
  var a = CurrencyCore.getCurrencyFromStream(stream, step1, step2);
  var b = CurrencyCore.getCurrencyFromStream(stream, step2, step3);
  var c = CurrencyCore.getCurrencyFromStream(stream, step3, step1);
  
  if(!a || !b || !c) return;
  
  var d = (a.rate) * (b.rate) * (c.rate);
  return d;
}

CurrencyCore.getCandidatesFromStreamViaPath = (stream, aPair, bPair)=>{
  var keys = {
    a: aPair.toUpperCase(),
    b: bPair.toUpperCase(),
    c: 'findme'.toUpperCase(),
  };
  
  var candidates = {};
  var apairs = stream.markets[keys.a];
  var bpairs = stream.markets[keys.b];
  
  var akeys = [];
  apairs.map((obj, i, array)=>{ akeys[obj.s.replace(keys.a, '')] = obj; });
  
  // prevent 1-steps
  delete akeys[keys.b];
  
  /*
    Loop through BPairs
      for each bpair key, check if apair has it too. 
      If it does, run arbitrage math
  */
  var bmatches = [];
  for(ib=0;ib<bpairs.length;ib++){
    var bPairTicker = bpairs[ib];
    bPairTicker.key = bPairTicker.s.replace(keys.b,'');
    
    // from B to C
    bPairTicker.startsWithKey = bPairTicker.s.startsWith(keys.b);
    
    // from C to B
    bPairTicker.endsWithKey = bPairTicker.s.endsWith(keys.b);
    
    if(akeys[bPairTicker.key]){       
       var match = bPairTicker;
       // check price from bPairTicker.key to keys.a
       var stepC = stream.obj[match.key + keys.a];
       if(stepC){
         stepC.flipped = false;
         stepC.rate = stepC.b;
       }else{
         stepC = stream.obj[keys.a + match.key];
         if(!stepC){
           // does this happen? should probably handle it just in case
           debugger;
         }else{
           stepC.flipped = true;
           stepC.rate = (1/stepC.b);
         }
       }
       
       // only do this if we definitely found a path. Some paths are impossible, so will result in an empty stepC quote.
       if(stepC){
         keys.c = match.key;
       
         var rate = CurrencyCore.getArbitageRate(stream, keys.a, keys.b, keys.c);
         if(isNaN(rate)){
           // debugger;
         }else{
           var triangle = {
             a: keys.a,
             b: keys.b,
             c: keys.c,
             rate: rate
           };
       
           bmatches.push(triangle);   
         }
       }    
    }
  }
  if(bmatches.length){
    bmatches.sort(function(a, b) { return parseFloat(b.rate) - parseFloat(a.rate); });
  }
  
  return bmatches;
}
CurrencyCore.getDynamicCandidatesFromStream = (stream, options)=>{
  var matches = []
  
  for(i=0;i<options.paths.length;i++){
    var pMatches = CurrencyCore.getCandidatesFromStreamViaPath(stream, options.start, options.paths[i]);
    matches = matches.concat(pMatches);
    // console.log("adding: " + pMatches.length + " to : " + matches.length);
  }
  
  
  // debugger;
  if(matches.length){
    matches.sort(function(a, b) { return parseFloat(b.rate) - parseFloat(a.rate); });
  }
  
  return matches;
}

/*
  starts at btc
  assumes purchase of eth via btc
  looks for a purhase via eth that leads back to btc.
*/
CurrencyCore.getBTCETHCandidatesFromStream = (stream)=>{
  var keys = {
    a: 'btc'.toUpperCase(),
    b: 'eth'.toUpperCase(),
    c: 'findme'.toUpperCase(),
  };
  
  var candidates = {};
  var apairs = stream.markets.BTC;
  var bpairs = stream.markets.ETH;
  
  var akeys = [];
  apairs.map((obj, i, array)=>{ akeys[obj.s.replace(keys.a, '')] = obj; });
  
  // prevent 1-steps
  delete akeys[keys.b];
  
  /*
    Loop through BPairs
      for each bpair key, check if apair has it too. 
      If it does, run arbitrage math
  */
  var bmatches = [];
  for(ib=0;ib<bpairs.length;ib++){
    var bPairTicker = bpairs[ib];
    bPairTicker.key = bPairTicker.s.replace(keys.b,'');
    
    // from B to C
    bPairTicker.startsWithKey = bPairTicker.s.startsWith(keys.b);
    
    // from C to B
    bPairTicker.endsWithKey = bPairTicker.s.endsWith(keys.b);
    
    if(akeys[bPairTicker.key]){       
       var match = bPairTicker;
       // check price from bPairTicker.key to keys.a
       var stepC = stream.obj[match.key + keys.a];
       if(stepC){
         stepC.flipped = false;
         stepC.rate = stepC.b;
       }else{
         stepC = stream.obj[keys.a + match.key];
         stepC.flipped = true;
         stepC.rate = (1/stepC.b);
       }
       
       keys.c = match.key;
       
       var rate = CurrencyCore.getArbitageRate(stream, keys.a, keys.b, keys.c);
       var triangle = {
         a: keys.a,
         b: keys.b,
         c: keys.c,
         rate: rate
       };
       
       bmatches.push(triangle);       
    }
  }
  
  if(bmatches.length){
    bmatches.sort(function(a, b) { return parseFloat(b.rate) - parseFloat(a.rate); });
  }
  return bmatches;
}


CurrencyCore.simpleArbitrageMath = (stream, candidates)=>{
  if(!stream || !candidates) return;
  //EURUSD * (1/GBPUSD) * (1/EURGBP) = 1 

  //start btc
  //via xUSDT
  //end btc
  
  var a = candidates['BTCUSDT'];
  var b = candidates['ETHUSDT'];
  var c = candidates['ETHBTC'];
  
  if(!a || isNaN(a) || !b || isNaN(b) || !c || isNaN(c)) return;
  
  //btcusd : (flip/usdEth) : ethbtc
  var d = (a.b) * (1/b.b) * (c.b);
  //debugger;
  return d;
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
    CurrencyCore.streams.allMarketTickers.markets[CurrencyCore.steps[i]] = stream.filter(e => (e.s.endsWith(CurrencyCore.steps[i]) || e.s.startsWith(CurrencyCore.steps[i])));
  
  // something's wrong here. The BNB tree doesn't have BTC, although the BTC tree does.
  
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
