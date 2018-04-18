const { Readable, Writable } = require('stream');

module.exports = class DBWriter extends Writable {
    constructor(params) {
        super({ objectMode: true });
        this.reader = params.reader;
        this.db = params.db;
        this.counter = 0;
    }
  
    _write(triples, encoding, cb) {
        let that = this;
        if (triples !== true) {
            this.db.put(triples, e => {
                if (e) this.emit('error', e);
                cb();
          })
        }
        else {
          cb();
        }
    }
  
    _final() {
      this.reader.emit('finish');
      // this.db.close();
    }
}
