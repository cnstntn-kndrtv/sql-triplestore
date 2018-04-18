const DBWriter = require('./DBWriter');
const HDTReader = require('./HDTReader');
const n3 = require('n3');
const fs = require('fs');
const path = require('path');


module.exports = class Parser {
    constructor() {
        this._parserTypes = {
            // rdfXml: [ '.xml', '.rdf' ],
            n3: [ '.n3', '.ttl' ],
            hdt: [ '.hdt' ]
        }
    }

    _getParserType(fileName) {
        let fileExt = path.extname(fileName);
        let parserType = null;
        for (let type in this._parserTypes) {
            this._parserTypes[type].forEach((ext) => {
                if (fileExt == ext) parserType = type;
            })
        }
        return parserType;
    }

    // {file: './test/test.hdt', db: db, readerimit: 5, dropTable: true}
    parseAndSave(params) {
        return new Promise((resolve, reject) => {
            let fileName = params.file;
            let db = params.db;
            let readerLimit = params.readerLimit || 50000;
            let dropTable = params.dropTable;
            let parserType = this._getParserType(fileName);

            console.log(`parse ${fileName}, type: ${parserType} and save to ${db.description} with read limit: ${readerLimit}`);
            db.authenticate()
                .then(() => {
                    if (dropTable) return db.drop();
                })
                .then(() => {
                    return db.createTable();
                })
                .then(() => {
                    let reader;
                    let writer;
                    switch (parserType) {
                        case 'n3':
                            reader = fs.createReadStream(fileName);
                            writer = new DBWriter({db: db, reader: reader});
                            let transformer = n3.StreamParser({format: 'N3'});
                            transformer.on('error', (e) => {
                                reject(e)
                            })
                            reader.on('finish', () => {
                                db.close();
                                resolve('ok');
                            });
                            reader.on('finish', () => {
                                db.close();
                                resolve('ok');
                            });
                        
                            reader.on('error', (e) => {
                                db.close();
                                reject(e);
                            })
                        
                            writer.on('error', (e) => {
                                db.close();
                                reject(e);
                            })
                            reader.pipe(transformer);
                            transformer.pipe(writer);
                            break;
                        case 'hdt':
                            reader = new HDTReader({fileName: fileName, limit: readerLimit});
                            writer = new DBWriter({db: db, reader: reader});
                            reader.on('finish', () => {
                                db.close();
                                resolve('ok');
                            });
                            reader.on('finish', () => {
                                db.close();
                                resolve('ok');
                            });
                        
                            reader.on('error', (e) => {
                                db.close();
                                reject(e);
                            })
                        
                            writer.on('error', (e) => {
                                db.close();
                                reject(e);
                            })
                            reader.pipe(writer);
                            break;
                        default:
                            break;
                    }
                    
                })
                .catch(e => {
                    db.close();
                    reject(e);
                })
        });
    }

}