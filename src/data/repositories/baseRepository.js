import * as ex from '../../utils/exceptions';
import log from '../../utils/logger';

export default class BaseRepository {

  async save(model) {
    let newModel = new this.Model(model);

    try {
      return await newModel.save();
    }
    catch(error) {
      log.error('Model save failed', error);
      return Promise.reject(ex.transform(error));
    }
  }

  async get(id) {
    try {
      return await this.Model.findById(id);
    } catch(error) {
      log.error(`Failed to get model ${id}`, error);
      return Promise.reject(ex.transform(error));
    }
  }

  async updateById(id, data) {
    try {
      return await this.Model.updateOne({_id: id}, data, {runValidators: true});
    } catch(error) {
      log.error(`Failed to update model ${id}`, error);
      return Promise.reject(ex.transform(error));
    }
  }
}