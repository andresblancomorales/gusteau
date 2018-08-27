import express from 'express';
//import {isDefined} from './utils/utilities';
import Configuration from './utils/configuration';
import connection from './data/connection';
import UserRepository from './data/repositories/userRepository';
import ClientRepository from './data/repositories/clientRepository';
import SessionRepository from './data/repositories/sessionRepository';
import UserManagement from './logic/userManagement';
import TokenManagement from './logic/tokenManagement';
import UsersResource from './resources/usersResource';
import TokenResource from './resources/tokenResource';
import * as cryptography from './utils/cryptography';
import logger from './utils/logger';

connection.then(error => {
  if (error) {
    logger.error('Failed to acquire database connection');
  }
  logger.info('Successfully acquired database connection');
}).catch(error => {
  if (error) {
    logger.error('Failed to acquire database connection', error);
    process.exit(1);
  }
});

const app = express();
app.use(express.json());

let userRepository = new UserRepository();
let userManagement = new UserManagement(userRepository, cryptography);
let usersResource = new UsersResource(userManagement);
usersResource.register(app);

let clientRepository = new ClientRepository();
let sessionRepository = new SessionRepository();
let tokenManagement = new TokenManagement(userRepository, clientRepository, sessionRepository, cryptography);
let tokenResource = new TokenResource(tokenManagement);
tokenResource.register(app);


// const security = (req, res, next) => {
//   if (isDefined(req.header("Authorization"))) {
//     next();
//   } else {
//     res.status(401);
//     res.json({error: 'AuthorizationHeaderMissing', description: 'The Basic Authorization Header is Missing'});
//   }
// };

// app.post('/', [security, getHelloWorld]);


app.listen(Configuration.SERVICE_PORT, () => {
});

