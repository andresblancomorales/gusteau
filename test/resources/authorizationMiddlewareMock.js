import {isDefined} from '../../src/utils/utilities';

export const testAuthorizationMiddleware = (req, res, next) => {
  if (isDefined(req.header("Authorization"))) {
    next();
  } else {
    res.status(401);
    res.end();
  }
};