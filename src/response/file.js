import { noop } from '#native';
import { openSync, writeSync, closeSync, unlinkSync } from 'node:fs';

export function createFileData(reader) {
  try {
    this.file.fd = openSync(this.file.path, 'w');
    this.setData = writeToFile;
    this.onError = onErrorFileData;
    this.onComplete = onCompleteFileData;
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
      reader.uint8,
      reader.offset + 6,
      reader.ending - reader.offset - 6
    );
  } catch (error) {
    this.file.fd = 0;
    this.data = error;
    this.setData = noop;
    this.resolve = this.reject;
    this.onError();
  }
}

function onErrorFileData() {
  try {
    if (this.file.fd) closeSync(this.file.fd);

    unlinkSync(this.file.path);
  } catch (error) {
    console.error(error);
  }
}

function onCompleteFileData(info) {
  try {
    closeSync(this.file.fd);
  } catch (error) {
    console.error(error);
  }
  this.resolve(Number(info[1]));
}
