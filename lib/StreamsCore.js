var TradingCore = require('./TradingCore').TradingCore;

module.exports = (ctrl)=>{
  this.tradingCore = new TradingCore();  

  ctrl.logger.info('--- Starting Currency Streams');
  // loading the CurrencyCore starts the streams, so we're not loading this until MongoDB is ready
  ctrl.currencyCore         = require('./CurrencyCore')(ctrl);
  
  // saving websocket ticks to DB
  ctrl.storage.saveRawTick  = (rows, db, logger, cb)=>{
    let rawTicksTable = db.collection(process.env.rawTicksTable);
    
    rawTicksTable.insertMany(rows, (err, result)=>{
      if(err){
        logger.error('--- MongoDB Error in saveRawTick(): ' + err);
        return (cb) ? cb(err, result) : false;
      }
      logger.debug('----- Logged '+result.result.n+' raw ticks to DB');
      return (cb) ? cb(err, result) : true;
    });
  }
  
  ctrl.storage.saveArbRows  = (rows, db, logger, cb)=>{
    let arbitrageTicksTable = db.collection(process.env.arbitrageTicksTable);
    
    arbitrageTicksTable.insertMany(rows, (err, result)=>{
      if(err){
        logger.error('--- MongoDB Error in saveArbRows(): ' + err);
        return (cb) ? cb(err, result) : false;
      }
      logger.debug('----- Logged '+result.result.n+' arbitrage rows to DB');
      return (cb) ? cb(err, result) : true;
    });
  }
  
  // every pingback from the websocket(s)
  ctrl.storage.streamTick   = (stream, streamID)=>{
    ctrl.storage.streams[streamID] = stream;
    
    if(streamID == 'allMarketTickers'){
      // Run logic to check for arbitrage opportunities
      ctrl.storage.candidates = ctrl.currencyCore.getDynamicCandidatesFromStream(stream, ctrl.options.arbitrage);
            
            
      // queue potential trades
      ctrl.storage.trading.queue = this.tradingCore.queueCandidates(ctrl.storage.candidates,  ctrl.options.trading, ctrl.storage.trading.queue);
      // Process queue without delay, in case it's time to act
      this.tradingCore.processQueue(ctrl.storage.trading.queue, ctrl.options.trading, ctrl.currencyCore, stream);
      
      // update UI with latest values per currency
      ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);
      
      if(ctrl.options.storage.logHistory){
        // Log arbitrage data to DB, if enabled
        ctrl.storage.saveArbRows(ctrl.storage.candidates, ctrl.storage.db, ctrl.logger);
        ctrl.storage.saveRawTick(stream.arr, ctrl.storage.db, ctrl.logger);
      }
      
    }
  };
  
};
