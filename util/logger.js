const { createLogger, format, transports } = require('winston');
const { SPLAT } = require('triple-beam');
const { isObject } = require('lodash');

const formatObject = (param) => {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}
const all = format((info) => {
    const splat = info[SPLAT] || [];
    const message = formatObject(info.message);
    const rest = splat.map(formatObject).join(' ');
    info.message = `${message} ${rest}`;
    return info;
});
const logger = createLogger({
    format: format.combine(
        all(),
        format.simple(),
        format.timestamp({format: 'DD-MM-YYYY HH:mm:ss'}),
        format.json(),
        format.prettyPrint(),
        format.printf(info => `[${info.timestamp}][${info.level}]: ${formatObject(info.message)}`)
    ),
    transports: [
        new transports.File({
            level: 'info',
            maxSize: 5120000,
            maxFiles: 5,
            filename: `${__dirname}/../logs/WABOT-info.log`
        }),
        new transports.File({
            level: 'error',
            maxSize: 5120000,
            maxFiles: 5,
            filename: `${__dirname}/../logs/WABOT-error.log`
        }),
        /*new transports.Console({
            level: 'info'
        })*/
    ]
});

module.exports = logger;