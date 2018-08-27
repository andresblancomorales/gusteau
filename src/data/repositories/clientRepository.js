import {Schema} from 'mongoose';
import mongoose from 'mongoose';
import BaseRepository from './baseRepository';
import log from "../../utils/logger";
import * as ex from "../../utils/exceptions";
import {ClientNotFoundException} from "../../utils/exceptions";

const ClientSchema = new Schema({
  name: {type: String, required: true},
  redirectUrl: {type: String, required: true},
  tokenTtl: {type: Number, required: true},
}, {
  collection: 'clients'
});

ClientSchema.statics.getByName = async function (name) {
  let client = await this.findOne({name: new RegExp(name, 'i')});
  if (client === null) {
    throw new ClientNotFoundException(name);
  }

  return client;
};

const Client = mongoose.model('Client', ClientSchema);

export default class ClientRepository extends BaseRepository {
  constructor() {
    super();
    this.Schema = ClientSchema;
    this.Model = Client;
  }

  async getByName(client) {
    try {
      return await this.Model.getByName(client);
    } catch(error) {
      log.error(`Failed to get client ${client}`, error);
      return Promise.reject(ex.transform(error));
    }
  }
}