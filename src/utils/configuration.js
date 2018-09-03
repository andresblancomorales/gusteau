import {isDefined} from './utilities';

class ConfigurationMissingException {
  constructor(variable) {
    this.name = 'ConfigurationMissingException';
    this.variable = variable;
    this.message = `Missing required environment variable ${variable}`;
  }
}

class Configuration {
  constructor(configurationPath) {
    /* eslint-disable*/
    if (process.env.NODE_ENV !== 'production') {
      if (!isDefined(configurationPath)) {
        require('dotenv').load();
      }
    }
    /* eslint-enable*/

    let loadVariable = (variable, required = true) => {
      /* eslint-disable*/
      let value = process.env[variable];
      /* eslint-enable*/
      if (required && !isDefined(value)) {
        throw new ConfigurationMissingException(variable);
      }

      return value;
    };

    this.DB_HOST = loadVariable('GUSTEAU_DB_HOST');
    this.DB_PORT = loadVariable('GUSTEAU_DB_PORT');
    this.DB_NAME = loadVariable('GUSTEAU_DB_NAME');
    this.SERVICE_PORT = loadVariable('GUSTEAU_SERVICE_PORT');
    this.LOG_FILE = loadVariable('GUSTEAU_LOG_FILE_PATH', false);
    this.LOG_LEVEL = loadVariable('GUSTEAU_LOG_LEVEL');
    this.JWT_SECRET = loadVariable('GUSTEAU_JWT_SECRET');
    this.JWT_ISSUER = loadVariable('GUSTEAU_JWT_ISSUER');
    this.QUERY_LIMIT = Number(loadVariable('GUSTEAU_QUERY_LIMIT'));
  }
}

export default Object.freeze(new Configuration());