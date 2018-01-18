// load logger library
const logger = require('./lib/LoggerCore')

var env = require('node-env-file');
env(__dirname + '/.keys');
env(__dirname + '/conf.ini');

if (!process.env.binance_key || !process.env.binance_secret) {
  throw 'Error: Specify your binance API settings in a file called ".keys". The .keys-template can be used as a template for how the .keys file should look.';
  process.exit(1);
};

logger.info('\n\n\n----- Bot Starting : -----\n\n\n');

var activePairs, exchangeAPI = {};

logger.info('--- Loading Exchange API');

// make exchange module dynamic later
if(process.env.activeExchange == 'binance'){
  logger.info('--- \tActive Exchange:' + process.env.activeExchange);
  activePairs = process.env.binancePairs;
  
  const api = require('binance');
  exchangeAPI = new api.BinanceRest({
    key: process.env.binance_key,
    secret: process.env.binance_secret,
    timeout: parseInt(process.env.restTimeout), // Optional, defaults to 15000, is the request time out in milliseconds
    recvWindow: parseInt(process.env.restRecvWindow), // Optional, defaults to 5000, increase if you're getting timestamp errors
    disableBeautification: process.env.restBeautify != 'true'
  });
  exchangeAPI.WS = new api.BinanceWS();
}

var botOptions = {
  UI: {
    title: 'Top Potential Arbitrage Triplets, via: ' + process.env.binanceColumns
  },
  arbitrage: {
    paths: process.env.binanceColumns.split(','),
    start: process.env.binanceStartingPoint
  },
  storage: {
    logHistory: false
  },
  trading: {
    paperOnly: true,
    // only candidates with over x% gain potential are queued for trading
    minQueuePercentageThreshold: 3,
    // how many times we need to see the same opportunity before deciding to act on it
    minHitsThreshold: 5
  }
},
ctrl = {
  options: botOptions,
  storage: {
    trading: {
      // queued triplets
      queue: [],
      // actively trading triplets
      active: []
    },
    candidates: [],
    streams: []
  },
  logger: logger,
  exchange: exchangeAPI
};

// load DBCore, then start streams once DB is up and connected
require('./lib/DBCore')(logger, (err, db)=>{
  if (process.env.useMongo == 'true'){
    ctrl.storage.db = db;
    ctrl.options.storage.logHistory = true;
  }
  
  if(err){
    ctrl.logger.error("MongoDB connection unavailable, history logging disabled: " + err)
    ctrl.options.storage.logHistory = false;
  }
  
  ctrl.UI       = require('./lib/UI')(ctrl.options),
  ctrl.events   = require('./lib/EventsCore')(ctrl);

  // We're ready to start. Load up the webhook streams and start making it rain.
  require('./lib/BotCore')(ctrl);
  
  ctrl.logger.info('----- Bot Startup Finished -----');
});














/*
    unused stuff for later
*/    

/*
 * onUserData requires an instance of BinanceRest in order to make the necessary startUserDataStream and
 * keepAliveUserDataStream calls.  The webSocket instance is returned by promise rather than directly
 * due to needing to request a listenKey from the server first.
 */
// exchangeAPI.WS.onUserData(binanceRest, (data) => {
//   // console.log(data);
// }, 60000) // Optional, how often the keep alive should be sent in milliseconds
// .then((ws) => {
//   // websocket instance available here
// });