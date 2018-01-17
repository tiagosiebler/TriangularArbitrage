// tradingCore.js
var TradingCore = function (options) {};

// take any rate above or = to threshold and add to queue. If already exists, add to rates array and increase hits tracking counter.
TradingCore.prototype.queueCandidates = (candidates, opts, queue)=>{
  let minQueuePercentageThreshold = (opts.minQueuePercentageThreshold) ? (opts.minQueuePercentageThreshold / 100) + 1 : 0;
  
  for(i=0;i<candidates.length;i++){
    let cand = candidates[i];
    
    if(cand.rate >= minQueuePercentageThreshold){
      let key = cand.a_step_from + cand.b_step_from + cand.c_step_from;
      
      // store in queue using trio key. If new, initialise rates and hits. Else increment hits by 1.
      if(!queue[key]){
        cand.rates = [];
        cand.hits = 1;
        queue[key] = cand;
      }else{
        queue[key].hits++;
      }
      queue[key].rates.push(cand.rate);     
       
    }else{
      // results are sorted descending by rate
      // break to loop, why waste CPU if the rest in this call are definitely not past the threshold.
      break;
    }
  }
  
  // place top candidates at beginning of queue
  if(queue) queue.sort(function(a, b) { return parseInt(b.hits) - parseInt(a.hits); });

  return queue;
};

// act on elements in the queue that 
TradingCore.prototype.processQueue = (queue, opts, currencyCore, stream)=>{
  let keys = Object.keys(queue);
  for(i=0;i<keys.length;i++){
    let cand = queue[keys[i]];
    
    let liveRate = currencyCore.getArbitageRate(stream, cand.a_step_from, cand.b_step_from, cand.c_step_from);
    if(liveRate >= opts.minQueuePercentageThreshold){
      // begin trading logic. Plan:
      /*
      
      
      */
    }
  }
}


exports.TradingCore = TradingCore;
