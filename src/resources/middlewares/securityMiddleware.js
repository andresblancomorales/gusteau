import {isDefined} from "../../utils/utilities";
import log from '../../utils/logger';

export default class AuthorizationMiddleware {
  constructor(tokenManagement) {
    this.tokenManagement = tokenManagement;
    this.middleWare = this.middleWare.bind(this);
  }

  middleWare(req, res, next) {
    let header = req.header('Authorization');

    if (!isDefined(header) ||
      !header.startsWith("Bearer ")) {
      log.error(`Failed to authorize token. Header: ${header}`);
      res.status(401);
      res.end();
    } else {
      let token = header.replace('Bearer ', '');

      this.tokenManagement.isSessionActive(token)
        .then(session => {
          req.gusteauSession = session;
          next();
        })
        .catch((error) => {
          log.error(`Failed to authorize token`, error);
          res.status(401);
          res.end();
        });
    }
  }
}