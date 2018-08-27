import {Schema} from 'mongoose';
import mongoose from 'mongoose';
import BaseRepository from './baseRepository';
import log from "../../utils/logger";
import * as ex from "../../utils/exceptions";
import {UserNotFoundException} from "../../utils/exceptions";

const UserSchema = new Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, lowercase: true, required: true},
  email: {type: String, lowercase: true, required: true},
  password: {type: String, required: true, select: false},
  roles: {
    type: [String],
    required: true,
    validate: {
      validator: value => { return value.length > 0; },
      message: props => `${props.value} must contain at least 1`
    }
  }
}, {
  collection: 'users'
});

UserSchema.statics.getByUsername = async function (username) {
  let user = await this.findOne({username: new RegExp(username, 'i')}, Object.keys(UserSchema.obj));
  if (user === null) {
    throw new UserNotFoundException(username);
  }

  return user;
};

UserSchema.statics.exists = function (username) {
  return this.count({username: new RegExp(username, 'i')}).then(count => {
    return Promise.resolve(count > 0)
  })
};

const User = mongoose.model('User', UserSchema);

export default class UserRepository extends BaseRepository {
  constructor() {
    super();
    this.Schema = UserSchema;
    this.Model = User;
  }

  async exists(username) {
    try {
      return await this.Model.exists(username);
    } catch (error) {
      log.error(`Failed to check user existence for username ${username}`, error);
      return Promise.reject(ex.transform(error));
    }
  }

  async getByUsername(username) {
    try {
      return await this.Model.getByUsername(username);
    } catch (error) {
      log.error(`Failed to get user with username ${username}`, error);
      return Promise.reject(ex.transform(error));
    }
  }
}