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
// import * as utils from './utils/utilities';

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

// sessionRepository.revokeActiveToken('5b84609a9daa1f427e16b35b', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlcyI6WyJjaGVmIl0sIl9pZCI6IjViODQ2MDlhOWRhYTFmNDI3ZTE2YjM1YiIsImZpcnN0TmFtZSI6IkFuZHJlcyIsImxhc3ROYW1lIjoiQmxhbmNvIiwidXNlcm5hbWUiOiJhbmRyZXMuYmxhbmNvQG90aHJlZS5pbyIsImVtYWlsIjoiYW5kcmVzLmJsYW5jb0BvdGhyZWUuaW8iLCJpYXQiOjE1MzU0MDUzNzU1NTksImV4cCI6MTUzNTQwNTQzNTU1OSwiaXNzIjoiZ3VzdGVhdSJ9.UW5nPchlsEixjTNunX9QAb0jfpO0DsQc6Rp6QWI8ygY', utils.getUTCNow()).then(sessions => {
//   logger.info("FOUND ACTIVE SESSIONS!", sessions);
// }).catch(error => {
//     logger.error("blew up", error)
//   });


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

