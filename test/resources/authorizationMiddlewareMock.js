import {isDefined} from '../../src/utils/utilities';

export const testAuthorizationMiddleware = (req, res, next) => {
  if (isDefined(req.header("Authorization"))) {
    req.gusteauSession = { _id: '001' };
    next();
  } else {
    res.status(401);
    res.end();
  }
};