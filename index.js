var env = require('node-env-file');
env(__dirname + '/.keys');
env(__dirname + '/conf.ini');

if (!process.env.binance_key || !process.env.binance_secret) {
  console.log('Error: Specify your binance API settings in a file called ".keys".');
  process.exit(1);
}

const api = require('binance');
const binanceRest = new api.BinanceRest({
    key: process.env.binance_key,
    secret: process.env.binance_secret,
    timeout: parseInt(process.env.restTimeout), // Optional, defaults to 15000, is the request time out in milliseconds
    recvWindow: parseInt(process.env.restRecvWindow), // Optional, defaults to 5000, increase if you're getting timestamp errors
    disableBeautification: process.env.restBeautify != 'true'
});

// make module dynamic later
var activePairs, exchangeAPI = {};
if(process.env.activeExchange == 'binance'){
  activePairs = process.env.binancePairs;
  exchangeAPI.WS = new api.BinanceWS();
}


// initialise root controller
var ctrl          = {};
    ctrl.options  = {
      UI: {
        title: 'Top Potential Arbitrage Triplets, via ETH'
      }
    },
    ctrl.UI               = require('./lib/UI.js')(ctrl.options),
    ctrl.events           = require('./lib/EventsCore.js')(ctrl);
    
    ctrl.currencyCore     = require('./lib/CurrencyCore.js')(activePairs, exchangeAPI, ctrl);
    ctrl.storage          = {};
    ctrl.storage.candidates = [];
    ctrl.storage.streams  = []
    ctrl.storage.streamTick = async (stream, key)=>{
      ctrl.storage.streams[key] = stream;
      // ctrl.storage.candidates = ctrl.currencyCore.getCandidatesFromStream(stream);
      
      // should be dynamic, ideally...
      ctrl.storage.candidates = ctrl.currencyCore.getDynamicCandidatesFromStream2(stream);
            
      // update UI with latest values per currency
      ctrl.UI.updateArbitageOpportunities(ctrl.storage.candidates);

      // ctrl.UI.updateTickers(ctrl.storage.candidates);
      
      // run arbitrage math
      // ctrl.currencyCore.checkArbitrage(stream, ctrl.storage.candidates);
    };
    
    

















/*
    unused stuff for later
*/    

/*
 * onUserData requires an instance of BinanceRest in order to make the necessary startUserDataStream and
 * keepAliveUserDataStream calls.  The webSocket instance is returned by promise rather than directly
 * due to needing to request a listenKey from the server first.
 */
exchangeAPI.WS.onUserData(binanceRest, (data) => {
  // console.log(data);
}, 60000) // Optional, how often the keep alive should be sent in milliseconds
.then((ws) => {
  // websocket instance available here
});