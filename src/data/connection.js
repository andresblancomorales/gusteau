import mongoose from 'mongoose';
import Configuration from '../utils/configuration';

async function initializeConnection() {
  await mongoose.connect(`mongodb://${Configuration.DB_HOST}:${Configuration.DB_PORT}/${Configuration.DB_NAME}`);

  return mongoose.connection;
}

export default initializeConnection();
