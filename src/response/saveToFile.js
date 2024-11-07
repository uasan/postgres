import { noop } from '#native';
import { resolveCount } from './state.js';
import { openSync, writeSync, closeSync, unlinkSync } from 'node:fs';

export class File {
  fd = 0;
  path = '';

  constructor(task, path) {
    this.path = path;
    task.onReady = resolveCount;
    task.setData = initSaveToFile;

    task.isSimpleQuery = false;
  }
}

export function initSaveToFile(reader) {
  try {
    this.file.fd = openSync(this.file.path, 'w');
    this.setData = writeToFile;
    this.onError = onError;
    this.onComplete = onComplete;

    this.setData(reader);
  } catch (error) {
    this.data = error;
    this.setData = noop;
    this.resolve = this.reject;
  }
}

function writeToFile(reader) {
  try {
    writeSync(
      this.file.fd,
      reader.bytes,
      reader.offset + 6,
      reader.ending - reader.offset - 6
    );
  } catch (error) {
    this.file.fd = 0;
    this.data = error;
    this.setData = noop;
    this.resolve = this.reject;
    this.client.cancelRequest();
    this.onError();
  }
}

function onError() {
  try {
    if (this.file.fd) closeSync(this.file.fd);

    unlinkSync(this.file.path);
  } catch (error) {
    console.error(error);
  }

  this.file = null;
  this.onError = noop;
}

function onComplete(info) {
  try {
    closeSync(this.file.fd);
  } catch (error) {
    console.error(error);
  }

  this.file = null;
  this.resolve(Number(info[1]));
}
