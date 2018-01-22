// DBHelpers.js
var DBHelpers = function () {};

// saving websocket ticks to DB
DBHelpers.prototype.saveRawTick  = (rows, db, logger, cb)=>{
  let rawTicksTable = db.collection(process.env.rawTicksTable);
  
  rawTicksTable.insertMany(rows, (err, result)=>{
    if (err){
      logger.error('--- MongoDB Error in saveRawTick(): ' + err);
      return (cb) ? cb(err, result) : false;
    }
    
    logger.debug('----- Logged '+result.result.n+' raw ticks to DB');
    return (cb) ? cb(err, result) : true;
  });
};

// save arbitrage calculation ticks to DB for later analysis
DBHelpers.prototype.saveArbRows  = (rows, db, logger, cb)=>{
  let arbitrageTicksTable = db.collection(process.env.arbitrageTicksTable);
  
  // console.log("----- saveArbRows()")
  // console.log("flipped: ", rows[0].a.flipped)
  // console.log(rows[0].a.stepFrom, rows[0].a.stepTo)
  // console.log(rows[0].a_step_from, rows[0].a_step_to)
  
  arbitrageTicksTable.insertMany(rows, (err, result)=>{
    if (err){
      logger.error('--- MongoDB Error in saveArbRows(): ' + err);
      return (cb) ? cb(err, result) : false;
    }
    
    logger.debug('----- Logged '+result.result.n+' arbitrage rows to DB');
    return (cb) ? cb(err, result) : true;
  });
};

exports.DBHelpers = DBHelpers;
