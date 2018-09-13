import {Schema} from 'mongoose';
import mongoose from 'mongoose';
import BaseRepository from './baseRepository';
import log from '../../utils/logger';
import * as ex from '../../utils/exceptions';

const CategorySchema = new Schema({
  name: {type: String, required: true},
  description: {type: String, required: true}
}, {
  collection: 'categories'
});

const Category = mongoose.model('Category', CategorySchema);

export default class CategoryRepository extends BaseRepository {
  constructor() {
    super();
    this.Schema = CategorySchema;
    this.Model = Category;
  }

  async getAll() {
    try {
      return await this.Model.find();
    } catch (error) {
      log.error(`Failed to get categories`, error);
      return Promise.reject(ex.transform(error));
    }
  }
}