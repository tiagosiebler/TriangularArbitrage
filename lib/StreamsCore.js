module.exports = (ctrl)=>{
  ctrl.logger.info('--- Starting Currency Streams');
  // loading the CurrencyCore starts the streams, so we're not loading this until MongoDB is ready
  ctrl.currencyCore         = require('./CurrencyCore')(ctrl);
  
  ctrl.storage.candidates   = [],
  ctrl.storage.streams      = [];
  
  // saving websocket ticks to DB
  ctrl.storage.saveArbRows  = (rows, db, cb)=>{
    const ticks = db.collection('ticks');
    ticks.insertMany(rows, cb);
  }
  
  // every pingback from the websocket(s)
  ctrl.storage.streamTick   = (stream, streamID)=>{
    ctrl.storage.streams[streamID] = stream;
    
    if(streamID == 'allMarketTickers'){
      // Run logic to check for arbitrage opportunities
      ctrl.storage.candidates = ctrl.currencyCore.getDynamicCandidatesFromStream(stream,ctrl.options.arbitrage);
            
      // update UI with latest values per currency
      ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);
      
      if(ctrl.options.storage.logHistory){
        ctrl.storage.saveArbRows(ctrl.storage.candidates, ctrl.storage.db, (err, result)=>{
          if(err)
            return ctrl.logger.error('--- MongoDB Error in streamTick(): ' + err);
          
          ctrl.logger.debug('----- Logged '+result.result.n+' arbitrage rows to DB');
        });
      }
    }
  };
  
};
