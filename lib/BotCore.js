var TradingCore = require('./TradingCore').TradingCore;
var DBHelpers = require('./DBHelpers').DBHelpers;
var PairRanker = require('./PairRanker').PairRanker;

module.exports = (ctrl)=>{
  this.tradingCore = new TradingCore();  
  this.dbHelpers = new DBHelpers(); 
  this.pairRanker = new PairRanker();
  ctrl.storage.pairRanks = [];
  
  
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
      ctrl.storage.trading.queue = this.tradingCore.queueCandidates(ctrl.storage.candidates,  ctrl.options.trading, ctrl.storage.trading.queue);
      // Process queue without delay, in case it's time to act
      this.tradingCore.processQueue(ctrl.storage.trading.queue, ctrl.options.trading, ctrl.currencyCore, stream);
      
      // update UI with latest values per currency
      ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);
      
      if(ctrl.options.storage.logHistory){
        // Log arbitrage data to DB, if enabled
        this.dbHelpers.saveArbRows(ctrl.storage.candidates, ctrl.storage.db, ctrl.logger);
        this.dbHelpers.saveRawTick(stream.arr, ctrl.storage.db, ctrl.logger);
      }
     
    }
  };
  
  ctrl.logger.info('--- Starting Currency Streams');
  // loading the CurrencyCore starts the streams, so we're not loading this until MongoDB is ready
  ctrl.currencyCore         = require('./CurrencyCore')(ctrl);
  
};
