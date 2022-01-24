const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    super(options);
    this._buffer = '';
  }

  _transform(chunk, encoding, callback) {
    const str = chunk.toString();
    const splitStr = str.split(os.EOL);

    if (str.indexOf(os.EOL) > -1) {
      splitStr.forEach((item, index) => {
        if (index === 0) {
          this.push(this._buffer+item);
          this._buffer = '';
        } else if (index === splitStr.length-1 && item.length > 0) {
          this._buffer = item;
        } else {
          this.push(item);
        }
      });
    } else {
      this._buffer += str;
    }
    callback();
  }

  _flush(callback) {
    if (this._buffer.length) {
      this.push(this._buffer);
    }
    callback();
  }
}

module.exports = LineSplitStream;
