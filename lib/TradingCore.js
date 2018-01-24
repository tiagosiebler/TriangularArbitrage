var inherits = require('util').inherits;  
var EventEmitter = require('events').EventEmitter;

module.exports = TradingCore;

function TradingCore(opts, currencyCore) {  
  if (!(this instanceof TradingCore)) return new TradingCore(opts, currencyCore);

  this._started = Date.now();
  this._minQueuePercentageThreshold = (opts.minQueuePercentageThreshold) ? (opts.minQueuePercentageThreshold / 100) + 1 : 0;
  this._minHitsThreshold = (opts.minHitsThreshold) ? opts.minHitsThreshold : 0;
  this._currencyCore = currencyCore;
  this._activeTrades = {};
  
  EventEmitter.call(this);
}

inherits(TradingCore, EventEmitter);

TradingCore.prototype.initiateTrade = function(pathInfo){
  var self = this;
  
  /*
   - 
  
  */
}
TradingCore.prototype.updateCandidateQueue = function(stream, candidates, queue){
  var self = this;
    
  for (let i=0;i<candidates.length;i++){
    let cand = candidates[i];
    
    if (cand.rate >= this._minQueuePercentageThreshold){
      let key = cand.a_step_from + cand.b_step_from + cand.c_step_from;
      
      // store in queue using trio key. If new, initialise rates and hits. Else increment hits by 1.
      if (!queue[key]){
        cand.rates = [];
        cand.hits = 1;
        queue[key] = cand;
      } else {
        queue[key].hits++;
      }
      queue[key].rates.push(cand.rate);     
       
    } else {
      // results are sorted descending by rate
      // break to loop, why waste CPU if the rest in this call are definitely not past the threshold.
      break;
    }
  }
  
  // place top candidates at beginning of queue
  if (queue){
    queue.sort(function(a, b) { return parseInt(b.hits) - parseInt(a.hits); });

    self.candidateQueue = queue;
    self.emit('queueUpdated', queue);
    self.processQueue(queue, stream, self.time());
  }

  return queue;
};


// act on elements in the queue that 
TradingCore.prototype.processQueue = function(queue, stream){
  var self = this;
  let keys = Object.keys(queue);

  for (let i=0;i<keys.length;i++){
    let cand = queue[keys[i]];
    
    if (cand.hits >= this._minHitsThreshold){
      
      let liveRate = self._currencyCore.getArbitageRate(stream, cand.a_step_from, cand.b_step_from, cand.c_step_from);
      if (liveRate && liveRate.rate >= this._minQueuePercentageThreshold){
        self.emit('newTradeQueued', cand, self.time());
        
        // begin trading logic. Plan:
        /*
        
      
        */
      }
    }
  }
};

TradingCore.prototype.time = function() {  
  var self = this;
  return this._started && Date.now() - this._started;
};