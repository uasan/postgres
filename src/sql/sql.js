import {
  FETCH_ALL,
  FETCH_ONE,
  FETCH_ONE_VALUE,
  TYPE_BLOB,
  TYPE_NATIVE,
} from '../constants.js';

export class SQL {
  mode = FETCH_ALL | TYPE_NATIVE;

  constructor(source, values, client = null) {
    this.source = source;
    this.values = values;
    this.client = client;
  }

  asObject() {
    this.mode = FETCH_ONE | TYPE_NATIVE;
    return this;
  }

  asValue() {
    this.mode = FETCH_ONE_VALUE | TYPE_NATIVE;
    return this;
  }

  asBlob() {
    this.mode = FETCH_ONE_VALUE | TYPE_BLOB;
    return this;
  }

  then(resolve, reject) {
    this.client
      .query(this.toString(), this.values, this.mode)
      .then(resolve, reject);
  }

  log() {
    console.log(this.toString(), this.values);
    return this;
  }

  toString() {
    const { source } = this;
    let text = source[0];
    for (let i = 1; i < source.length; i++) text += '$' + i + source[i];
    return text;
  }
}
