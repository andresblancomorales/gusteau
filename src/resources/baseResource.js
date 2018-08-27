import {NotImplementedException} from '../utils/exceptions';

export default class BaseResource {

  /* eslint-disable*/
  register(expressApp) {
    throw new NotImplementedException('register');
  }
  /* eslint-enable*/
}