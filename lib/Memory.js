 
// constructor
function Trades(currency, options) {
  if (!(this instanceof Trades)) {
    return new Trades(options);
  }

  this.options = options;
};


UI.prototype.addTrade = function(time, symbol, tradeId, price, quantity){
  this.line = new Line(this.outputBuffer)
    .column(time.toString(), this.cols[0])
    .column(symbol.toString(), this.cols[1])
    .column(price.toString(), this.cols[2])
    .column(quantity.toString(), this.cols[3])
    .fill()
    .store();
      
  this.updateUI();
    
}

module.exports = Trades;
