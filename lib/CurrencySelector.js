var moduleObj = {};

moduleObj.init = (selectorRaw, exchangeAPI)=>{
  /* Currency selector stuff */
  moduleObj.selectorRaw    = selectorRaw;  //XRP-ETH
  moduleObj.splitSelector  = moduleObj.selectorRaw.split('-');//XRP, ETH array
  moduleObj.key            = moduleObj.splitSelector.join('');//XRPETH
  moduleObj.asset          = moduleObj.splitSelector[0];//XRP
  moduleObj.selector       = moduleObj.splitSelector[1];//ETH
  
  // sockets stuff
  moduleObj.interval       = '30s';
  moduleObj.exchangeAPI    = exchangeAPI;

  // placeholders
  moduleObj.events     = {};
  moduleObj.trades     = {};
  moduleObj.orderBook  = {};
  moduleObj.sockets  = {};
  moduleObj.handleEvent = ()=>{};
  
  return moduleObj;
};
 
// start web sockets for this currency selector
moduleObj.startWSockets = () => {
  /*
  * WebSocket API
  *
  * Each call to onXXXX initiates a new websocket for the specified route, and calls your callback with
  * the payload of each message received.  Each call to onXXXX returns the instance of the websocket
  * client if you want direct access(https://www.npmjs.com/package/ws).
  */
  
  moduleObj.sockets.depth = moduleObj.exchangeAPI.WS.onDepthUpdate(
    moduleObj.key, 
    moduleObj.handleEvent);

  moduleObj.sockets.trade = moduleObj.exchangeAPI.WS.onAggTrade(
    moduleObj.key, 
    moduleObj.handleEvent);                                      
                            
  moduleObj.sockets.kline = moduleObj.exchangeAPI.WS.onKline(
    moduleObj.key, 
    moduleObj.interval, 
    moduleObj.handleEvent);
};

module.exports = moduleObj.init;