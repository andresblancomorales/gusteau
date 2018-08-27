import jwt from 'jsonwebtoken';
import configuration from './configuration';
import {getUTCNow} from './utilities';
import log from './logger';
import {transform} from './exceptions';

export function createToken(payload, client) {
  return Promise.resolve().then(() => {
    let pl = {
      ...payload,
      iat: getUTCNow(),
    };
    return jwt.sign(pl, configuration.JWT_SECRET, {
      expiresIn: client.tokenTtl,
      issuer: configuration.JWT_ISSUER
    });
  });
}

export function verifyToken(token) {
  return Promise.resolve().then(() => {
    try {
      return jwt.verify(token, configuration.JWT_SECRET, {
        issuer: configuration.JWT_ISSUER,
        clockTimestamp: getUTCNow(),
      })
    } catch (error) {
      log.error('Failed to verify token', error);
      throw transform(error);
    }
  })
}