const fs = require('fs');
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// prepare logging
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

const tsFormat = () => (new Date()).toLocaleTimeString();
const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
  format: combine(
    label({ label: '' }),
    timestamp(),
    myFormat
  ),
  transports: [
    // colorize the output to the console
    new transports.File({
      timestamp: tsFormat,
      filename: `${logDir}/error.log`,
      level: 'error'
    }),
    new transports.File({
      timestamp: tsFormat,
      filename: `${logDir}/combined.log`,
      level: 'info'
    }),
    new transports.File({
      filename: `${logDir}/debug.log`,
      timestamp: tsFormat,
      level: 'debug'
    })
  ]
});

module.exports = logger;
