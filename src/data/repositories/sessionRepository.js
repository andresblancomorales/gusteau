import {Schema} from 'mongoose';
import mongoose from 'mongoose';
import BaseRepository from './baseRepository';
import * as ex from "../../utils/exceptions";
import log from "../../utils/logger";

const SessionSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, required: true},
  startDate: {type: Number, required: true},
  token: {type: String, required: true},
  client: {type: Schema.Types.ObjectId, required: true},
  expirationDate: {type: Number, required: true},
  state: {type: String, required: true}
}, {
  collection: 'sessions'
});

SessionSchema.statics.isSessionActive = async function (userId, token, referenceDate) {
  let count = await this.count({
    userId: userId,
    expirationDate: {$gt: referenceDate},
    token: token,
    state: 'Valid'
  });
  return count > 0;
};

SessionSchema.statics.revokeActiveToken = async function (userId, token, referenceDate) {
  let result = await this.updateOne({
    userId: userId,
    expirationDate: {$gt: referenceDate},
    token: token,
    state: 'Valid'
  }, {
    state: 'Revoked'
  });

  return result.nModified > 0;
};

const Session = mongoose.model('Session', SessionSchema);

export default class SessionRepository extends BaseRepository {
  constructor() {
    super();
    this.Schema = SessionSchema;
    this.Model = Session;
  }

  async isSessionActive(userId, token, referenceDate) {
    try {
      return await this.Model.isSessionActive(userId, token, referenceDate);
    } catch (error) {
      log.error(`Failed to check the user's ${userId} session`, error);
      return Promise.reject(ex.transform(error));
    }
  }

  async revokeActiveToken(userId, token, referenceDate) {
    try {
      return await this.Model.revokeActiveToken(userId, token, referenceDate);
    } catch (error) {
      log.error(`Failed to revoke the user's ${userId} token`, error);
      return Promise.reject(ex.transform(error));
    }
  }
}