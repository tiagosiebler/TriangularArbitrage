var CurrencyCore = {};

CurrencyCore.events = {};
CurrencyCore.events.onAllTickerStream = ()=>{},
controller = {};

function intersect_arrays(a, b) {
    var sorted_a = a.concat().sort();
    var sorted_b = b.concat().sort();
    var common = [];
    var a_i = 0;
    var b_i = 0;

    while (a_i < a.length
           && b_i < b.length)
    {
        if (sorted_a[a_i] === sorted_b[b_i]) {
            common.push(sorted_a[a_i]);
            a_i++;
            b_i++;
        }
        else if(sorted_a[a_i] < sorted_b[b_i]) {
            a_i++;
        }
        else {
            b_i++;
        }
    }
    return common;
}

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
  return await filter(arr, async a => 
    (a.s.startsWith(key.toUpperCase()) || a.s.endsWith(key.toUpperCase())));
}
CurrencyCore.filterByKeyNot = async (arr, key, notKey)=>{
  return await filter(arr, async a => 
    (a.s.startsWith(key.toUpperCase()) || a.s.endsWith(key.toUpperCase())) &&
    !(a.s.startsWith(notKey.toUpperCase()) || a.s.endsWith(notKey.toUpperCase()))
  );
}

CurrencyCore.getKeys = async (arr, filterKey, skipKey)=>{
  arr = await filter(arr, async a => (a.s.indexOf(filterKey) != -1) );
  arr = await arr.map(async (obj)=>{
    return obj.s.replace(filterKey, '');
  })
  return arr;
}

CurrencyCore.getCandidatesFromStream = (stream)=>{
  var candidates = [];
  for(i=0;i<CurrencyCore.selectors.length;i++){
    var sel = CurrencyCore.selectors[i].replace('-','');
    candidates[sel] = stream.obj[sel];
  }
  return candidates;
}

CurrencyCore.getCurrencyFromStream = (stream, fromCur, toCur)=>{
  if(!stream || !fromCur || !toCur) return;
    
  var currency = stream.obj[fromCur + toCur];
  if(currency){
    currency.flipped = false;
    currency.rate = currency.b;
  }else{
    currency = stream.obj[toCur + fromCur];
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
CurrencyCore.getDynamicCandidatesFromStream2 = (stream)=>{
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

CurrencyCore.getDynamicCandidatesFromStream = async (stream)=>{
  var candidates = {};
  var triangles = [];
  var promises = [];
  var keys = {};
  
  keys.a = 'btc'.toUpperCase();
  keys.c = 'usdt'.toUpperCase();
  
  var stepA = {
    obj: {},
    flipped: false,
    key: '',
    rate: 0
  };
  var stepB = Object.create(stepA),
      stepC = Object.create(stepA);
  
  // all currencies we can go to from btc
  /*
  promises.push(CurrencyCore.filterByKey(stream.arr, 'btc'))
  promises.push(CurrencyCore.filterByKey(stream.arr, 'eth'))
  var steps = await Promise.all(promises);//*/
  
  // all candidates that match the starting currency
  candidates.stepA = await CurrencyCore.filterByKey(stream.arr, keys.a);
  stepA.vector = keys.a;//btc
  
//STEP 1
  
  // loop all possible places we can go from step 1 (BTC)
  for(ia=0;ia<candidates.stepA.length;ia++){
    //ETHBTC
    var aCandidate = candidates.stepA[ia];

    // ETH
    stepA.target = aCandidate.s.replace(keys.a.toUpperCase(), '').toUpperCase();
    
    // Get BTC->ETH (step1.a->step1.b) info
    stepA.obj = stream.obj[stepA.vector+stepA.target];
    if(stepA.obj){
      stepA.key = stepA.obj.s;
      stepA.rate = stepA.obj.b;
    }else{
      stepA.obj = stream.obj[stepA.target+stepA.vector];
      stepA.key = stepA.obj.s;
      stepA.rate = (1/stepA.obj.b);
      stepA.flipped = true;
    }
    
//STEP 2
    
    // load step 2 candidates, that have a match for the possible stepA pair
    // loop all possible places we can go from step 2 (ETH)
    candidates.stepB = await CurrencyCore.filterByKeyNot(stream.arr, stepA.target, stepA.vector);    
    
    // any possible steps from A to B to C, that aren't A? Bleh
    candidates.stepB = await CurrencyCore.filterByKeyNot(candidates.stepB, keys.c, stepA.vector);  
    
    if(candidates.stepB.length){      
      // always only one route from here?
      stepB.obj = candidates.stepB[0];
      stepB.key = stepB.obj.s;
      stepB.vector = stepA.target;
      stepB.target = stepB.key.replace(stepB.vector, '');
      
      if(stepB.obj.s.startsWith(stepA.target)){
        stepB.rate = stepB.obj.b;
        stepB.flipped = false;
      }else{
        stepB.rate = (1/stepB.obj.b);
        stepB.flipped = true;
      }
      stepB.key = stepB.obj.s;
      
      stepC.obj = stream.obj[stepB.target+stepA.vector];
      if(stepC.obj){
        stepC.flipped = false;
        stepC.rate = stepC.obj.b;
      }else{
        stepC.obj = stream.obj[stepA.vector+stepB.target];
        stepC.flipped = true;
        stepC.rate = (1/stepC.obj.b);
      }

      if(stepC.obj){
        stepC.key = stepC.obj.s;
        
        var candidate = {
          stepA: stepA,
          stepB: stepB,
          stepC: stepC,
          ratio: (stepA.rate * stepB.rate * stepC.rate)
        }
        
        triangles.push(candidate);
      }      
      
      
      
    }
    return triangles;
  }
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
  //debugger;
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
