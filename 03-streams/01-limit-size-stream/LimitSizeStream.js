const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    super(options);
    this.limit = options.limit || null;
    this._counter = 0;
  }

  _transform(chunk, encoding, callback) {
    if (this.limit) {
      this._counter += Buffer.byteLength(chunk, 'utf-8');
      if (this._counter > this.limit) {
        callback(new LimitExceededError(), null);
        return;
      }
    }
    callback(null, chunk);
  }
}

module.exports = LimitSizeStream;
