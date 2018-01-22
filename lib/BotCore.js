var TradingCore = require('./TradingCore');
var DBHelpers = require('./DBHelpers').DBHelpers;
var PairRanker = require('./PairRanker').PairRanker;

module.exports = (ctrl)=>{
  this.dbHelpers = new DBHelpers(); 
  this.pairRanker = new PairRanker();
    
  // every pingback from the websocket(s)
  ctrl.storage.streamTick   = (stream, streamID)=>{   
    ctrl.storage.streams[streamID] = stream;
    
    if(streamID == 'allMarketTickers'){
      // Run logic to check for arbitrage opportunities
      ctrl.storage.candidates = ctrl.currencyCore.getDynamicCandidatesFromStream(stream, ctrl.options.arbitrage);
      
  	  // Run logic to check for each pairs ranking
  	  var pairToTrade = this.pairRanker.getPairRanking(ctrl.storage.candidates, ctrl.storage.pairRanks, ctrl, ctrl.logger); 
  	  if(pairToTrade != "none"){
  		 // console.log("<----GO TRADE---->");
  	  }
	 
      // queue potential trades
      if(this.tradingCore)
        this.tradingCore.updateCandidateQueue(stream, ctrl.storage.candidates, ctrl.storage.trading.queue);
            
      // update UI with latest values per currency
      ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);
      
      if(ctrl.options.storage.logHistory){
        // Log arbitrage data to DB, if enabled
        this.dbHelpers.saveArbRows(ctrl.storage.candidates, ctrl.storage.db, ctrl.logger);
        this.dbHelpers.saveRawTick(stream.arr, ctrl.storage.db, ctrl.logger);
      }
     
    }
  };
  
  // loading the CurrencyCore starts the streams
  ctrl.logger.info('--- Starting Currency Streams');
  ctrl.currencyCore = require('./CurrencyCore')(ctrl);

  this.tradingCore = TradingCore(ctrl.options.trading, ctrl.currencyCore);
  // use this for callbacks for ongoing trade workflows
  // this.tradingCore.on('queueUpdated', (queue, timeStarted)=>{  });
  // this.tradingCore.on('newTradeQueued', (candidate, timeStarted)=>{  });
};
