module.exports = (ctrl)=>{
  ctrl.logger.info('--- Starting Currency Streams');
  // loading the CurrencyCore starts the streams, so we're not loading this until MongoDB is ready
  ctrl.currencyCore         = require('./CurrencyCore')(ctrl);
  
  ctrl.storage.candidates   = [],
  ctrl.storage.streams      = [],
  ctrl.storage.streamTick   = async (stream, streamID)=>{
    ctrl.storage.streams[streamID] = stream;
    // Run logic to check for arbitrage opportunities
    ctrl.storage.candidates = ctrl.currencyCore.getDynamicCandidatesFromStream(stream,ctrl.options.arbitrage);
        
    // update UI with latest values per currency
    ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);
  };
  
  ctrl.logger.info('----- Bot Startup Finished -----');
};
