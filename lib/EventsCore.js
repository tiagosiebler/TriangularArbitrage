var moduleObj = {};

moduleObj.init = (ctrl)=>{
  moduleObj.ctrl  = ctrl;
  moduleObj.UI    = ctrl.UI;
  return moduleObj;
};
 
// universal events processor
// currently unused
moduleObj.wsEvent = (event) => {  

  // return;
  //debugger;
  
  if (event.eventType){
    var type = event.eventType;
    if (type == 'depthUpdate'){
      //
    } else if (type == 'aggTrade'){
      // moduleObj.UI.addTrade(event.eventTime, event.symbol, event.tradeId, event.price, event.quantity);
      // console.log("handle.wsEvent().aggTrade(): ", event);
    } else {
      //console.log("handle.wsEvent(): ", event);
    }
  }
};

module.exports = moduleObj.init;