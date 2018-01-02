module.exports = (ctrl)=>{
  ctrl.logger.info('--- Starting Currency Streams');
  // loading the CurrencyCore starts the streams, so we're not loading this until MongoDB is ready
  ctrl.currencyCore         = require('./CurrencyCore')(ctrl);
  
  ctrl.storage.candidates   = [],
  ctrl.storage.streams      = [];
  
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
      // Log raw ticks to DB, if enabled
      if(ctrl.options.storage.logHistory) ctrl.storage.saveRawTick(stream.arr, ctrl.storage.db, ctrl.logger)
      
      // Run logic to check for arbitrage opportunities
      ctrl.storage.candidates = ctrl.currencyCore.getDynamicCandidatesFromStream(stream,ctrl.options.arbitrage);
            
      // update UI with latest values per currency
      ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);
      
      // Log arbitrage data to DB, if enabled
      if(ctrl.options.storage.logHistory) ctrl.storage.saveArbRows(ctrl.storage.candidates, ctrl.storage.db, ctrl.logger);
    }
  };
  
};
