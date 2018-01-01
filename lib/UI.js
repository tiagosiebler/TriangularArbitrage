var CLI = require('clui'),
    clc = require('cli-color');

var Line        = CLI.Line,
    LineBuffer  = CLI.LineBuffer;
    
var UI = {};
// constructor
UI.init = (options)=>{
  UI.options = options;
  
  UI.outputBuffer  = new LineBuffer({
    x: 0,
    y: 0,
    width: 'console',
    height: 'console'
  });

  UI.message = new Line(UI.outputBuffer)
    .column(UI.options.UI.title, UI.options.UI.title.length, [clc.green])
    .fill()
    .store();

  UI.blankLine = new Line(UI.outputBuffer)
    .fill()
    .store();

  UI.cols = [10, 10, 20]
    /*
  UI.header = new Line(UI.outputBuffer)
    .column('Time', UI.cols[0], [clc.cyan])
    .column('Symbol', UI.cols[1], [clc.cyan])
    
    .column('Bid Price', UI.cols[2], [clc.cyan])
    .column('Bid Volume', UI.cols[3], [clc.cyan])
    
    .column('Ask Price', UI.cols[2], [clc.cyan])
    .column('Ask Volume', UI.cols[3], [clc.cyan])

    .column('Trades', UI.cols[1], [clc.cyan])
    
    .fill()
    .store();//*/
    
  UI.header = new Line(UI.outputBuffer)
    .column('Step A', UI.cols[0], [clc.cyan])
    .column('Step B', UI.cols[0], [clc.cyan])
    .column('Step C', UI.cols[0], [clc.cyan])

    .column('Rate', UI.cols[1], [clc.cyan])
    
    .column('Fees BnB', UI.cols[1], [clc.cyan])
    .column('(Rate - BnB Fee)', 20, [clc.green])
    
    .column('Fees Normal', 17, [clc.cyan])
    .column('(Rate - Fee)', 20, [clc.green])
    
    .fill()
    .store();

  UI.line;
  UI.maxRows = process.env.maxRows;
  UI.outputBuffer.output();
  
  return UI;
};

UI.updateArbitageOpportunities = (tickers)=>{
  if(!UI.outputBuffer || !tickers){
    return;
  }
    
  UI.outputBuffer.lines.splice(3, UI.outputBuffer.lines.length - 3)    
  //UI.maxRows = keys.length + 2;
  
  for(i=0;i<UI.maxRows;i++){
    var ticker = tickers[i];
    if(!ticker) return;
    
    var color = clc.green;
    if(ticker.rate && ticker.rate < 1) color = clc.red;
    
    if(ticker.a){
      var rate = ((ticker.rate - 1)* 100);
      var fees1 = rate * 0.05; //bnb
      var fRate1 = rate - fees1;
      
      var fees2 = rate * 0.1; //other
      var fRate2 = rate - fees2;
            
      UI.line = new Line(UI.outputBuffer)
        .column(ticker.a.toString(), UI.cols[0], [clc.cyan])
        .column(ticker.b.toString(), UI.cols[0], [clc.cyan])
        .column(ticker.c.toString(), UI.cols[0], [clc.cyan])
        .column(rate.toFixed(3).toString() + '%', UI.cols[1], [clc.cyan])
        .column(fees1.toFixed(3).toString() + '%', UI.cols[1], [clc.cyan])
        .column(fRate1.toFixed(3).toString() + '%', 20, [color])
      
        .column(fees2.toFixed(3).toString() + '%', 17, [clc.cyan])
        .column(fRate2.toFixed(3).toString() + '%', 20, [color])
      
      
        .fill()
        .store();
    }else{
      UI.line = new Line(UI.outputBuffer)
        .fill()
        .store();
    }
  }
  
  UI.outputBuffer.output();
}

UI.updateTickers = (tickers)=>{
  if(!UI.outputBuffer || !tickers){
    return;
  }
  
  
  var keys = Object.keys(tickers).sort();
  if(UI.outputBuffer.lines.length >= keys.length) UI.outputBuffer.lines.splice(3, keys.length)    
  
  //UI.maxRows = keys.length + 2;
  
  for(i=0;i<keys.length;i++){
    var ticker = tickers[keys[i]];
    if(!ticker) return;
    
    
    //*
    UI.line = new Line(UI.outputBuffer)
      .column(ticker.E.toString(), UI.cols[0])
      .column(ticker.s.toString(), UI.cols[1])
    // bid
      .column(ticker.b.toString(), UI.cols[2])
      .column(ticker.B.toString(), UI.cols[3])
    
    // ask
      .column(ticker.a.toString(), UI.cols[2])
      .column(ticker.A.toString(), UI.cols[3])

      .column(ticker.n.toString(), UI.cols[1])
      .fill()
    .store();//*/
        
  } 
  UI.outputBuffer.output();
}


/*
    { eventType: 'aggTrade',
      eventTime: 1514559250559,
      symbol: 'XRPETH',
      tradeId: 916488,
      price: '0.00224999',
      quantity: '100.00000000',
      firstTradeId: 1090457,
      lastTradeId: 1090457,
      time: 1514559250554,
      maker: false,
      ignored: true }

*/
UI.updateUI = function(trimOld){
  if(trimOld && UI.outputBuffer.lines.length > UI.maxRows) UI.outputBuffer.lines.splice(3, 1)
  UI.outputBuffer.output();
}

UI.addTrade = function(time, symbol, tradeId, price, quantity){
  UI.line = new Line(UI.outputBuffer)
    .column(time.toString(), UI.cols[0])
    .column(symbol.toString(), UI.cols[1])
    .column(price.toString(), UI.cols[2])
    .column(quantity.toString(), UI.cols[3])
    .fill()
    .store();
      
  UI.updateUI(true);
}



module.exports = UI.init;
