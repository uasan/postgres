import { CacheContext } from '../explain/context.js';

export class CacheQuery extends Map {
  constructor(task) {
    CacheContext.analyze(task, super()).catch(console.error);
  }
}
