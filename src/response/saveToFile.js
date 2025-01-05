import { noop } from '#native';
import { readCountRows } from './complete.js';
import { openSync, write, writeSync, closeSync, unlinkSync } from 'node:fs';

const DEFAULT_OPTIONS = {
  isWriteAsync: false,
};
export class File {
  fd = 0;
  path = '';

  onWrite = noop;
  options = DEFAULT_OPTIONS;

  constructor(task, path, options = DEFAULT_OPTIONS) {
    this.path = path;
    this.options = options;

    task.data = null;
    task.setData = initSaveToFile;

    task.isSimpleQuery = false;

    this.onWrite = error => {
      if (error) {
        task.onError(error);
      }
      task.client.reader.resume();
    };
  }
}

export function initSaveToFile(reader) {
  this.onError = onError;

  try {
    this.file.fd = openSync(this.file.path, 'w');
    this.onComplete = onComplete;

    this.setData = this.file.options.isWriteAsync
      ? writeToFileAsync
      : writeToFileSync;

    this.setData(reader);
  } catch (error) {
    this.onError(error);
  }
}

function writeToFileSync(reader) {
  try {
    writeSync(
      this.file.fd,
      reader.bytes,
      reader.offset + 4,
      reader.ending - reader.offset - 4
    );
  } catch (error) {
    this.onError(error);
  }
}

function writeToFileAsync(reader) {
  write(
    this.file.fd,
    reader.bytes.slice(reader.offset + 4, reader.ending),
    undefined,
    this.file.onWrite
  );

  reader.pause();
}

function onError(error) {
  try {
    if (this.file?.fd) {
      closeSync(this.file.fd);
      unlinkSync(this.file.path);
    }
  } catch (error) {
    console.error(error);
  }

  this.resolve = () => {
    this.reject(error);
  };

  this.setData = noop;
  this.client.cancelRequest();

  this.file = null;
  this.onError = noop;
}

function onComplete() {
  try {
    if (this.file?.fd) closeSync(this.file.fd);
  } catch (error) {
    console.error(error);
  }

  this.count = readCountRows(this.client);

  if (this.count === 0 && this.errorNoData) {
    this.reject(this.errorNoData);
  } else {
    this.resolve(this.count);
  }

  this.file = null;
}
