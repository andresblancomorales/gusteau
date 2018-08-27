import bunyan from "bunyan";
import Configuration from './configuration';
import {isDefined} from './utilities';

const createLogger = () => {
  let stream = {
    level: Configuration.LOG_LEVEL,
    /* eslint-disable*/
    stream: process.stdout
    /* eslint-enable */
  };
  if (isDefined(Configuration.LOG_FILE)) {
    stream = {
      level: Configuration.LOG_LEVEL,
      path: Configuration.LOG_FILE
    }
  }

  return bunyan.createLogger({
    name: 'gusteau',
    streams: [stream]
  });
};

export default createLogger();