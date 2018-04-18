const { Readable } = require('stream');
const hdt = require('hdt');

module.exports = class HDTReader extends Readable {
    constructor(params) {
        super({objectMode: true})
        this.fileName = params.fileName;
        this._limit = params.limit;
        this._offset = 0;
        this._hdtDocument = null;
        this._isReady = false;
    }
  
    _openHDT(){
        return new Promise((resolve, reject) => {
            hdt.fromFile(this.fileName)
              .then((hdtDoc) => {
                  this._hdtDocument = hdtDoc;
              })
              .then(() => {
                  this._isReady = true;
                  console.log(`hdt opened. ${this.fileName}`);
                  resolve();
              })
              .catch((e) => this.emit('error', e))
        });
    }
  
    _closeHDT(){
        console.log(`close hdt: ${this.fileName}`);
        this._hdtDocument.close();
    }
  
    _readNext(){
        return new Promise((resolve, reject) => {
            this._hdtDocument.searchTriples(null, null, null, { offset: this._offset, limit: this._limit })
            .then((result) => {
                resolve(result);
            }).catch((e) => this.emit('error', e));
        });
    }
  
    _read(){
        if(this._isReady) {
            this._readNext()
                .then((result) => {
                    if (result.triples.length != 0) {
                        this._offset += this._limit;
                        this.push(result.triples);
                    }
                    else {
                        this.push(null);
                        this._closeHDT();
                    }
                })
        }
        else {
            this._openHDT()
                .then(() => {
                    this.push(true, null, null);
                })
        }
    }
}

