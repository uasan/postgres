import { noop } from '#native';
import { setComplete } from '../response/complete.js';

export class SimpleQuery {
  columns = [];
  decoders = [];

  complete = setComplete;
  getCountRows = noop;

  execute() {
    //
  }
}
