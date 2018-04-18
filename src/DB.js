const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = class DB {
    constructor(params) {
        this._dbConfig = {
            dialect: params.dialect,
            database: params.database,
            host: params.host,
            port: params.port,
            username: params.username,
            password: params.password,
            operatorsAliases: Op,
            storage: params.storage,
            logging: false
        }
    
        this._db = new Sequelize(this._dbConfig);
      
        this._triplesTableName = params.table || 'triples';
        this._subjTableName = this._triplesTableName + '_subject';
        this._predTableName  = this._triplesTableName + '_predicate';
        this._objTableName  = this._triplesTableName + '_object';
    
        this._sModel = require('../models/spo')(this._db, Sequelize.DataTypes, { table: this._subjTableName });
        this._pModel = require('../models/spo')(this._db, Sequelize.DataTypes, { table: this._predTableName });
        this._oModel = require('../models/spo')(this._db, Sequelize.DataTypes, { table: this._objTableName });
        
        let assistModels = {
            subject: this._sModel,
            predicate: this._pModel,
            object: this._oModel
        }

        this._model = require('../models/triple')(this._db, Sequelize.DataTypes, { table: this._triplesTableName,  assistModels: assistModels});

        this.description = (this._dbConfig.dialect == 'sqlite') ? 
            `${this._dbConfig.storage} : ${this._dbConfig.database} / ${this._triplesTableName}` :
            `${this._dbConfig.host} : ${this._dbConfig.database} / ${this._triplesTableName}` ;
    }
  
    async authenticate() {
        await this._db.authenticate()
        console.log(`connection authenticated ${this.description}`);
    }
  
    async createTable() {
        await this._db.sync();
        console.log(`tables created ${this.description}`);
    }
  
    async drop() {
        await this._db.drop()
        console.log(`drop tables ${this.description}`);
    }
  
    close() {
      this._db.close();
      console.log(`connection closed ${this.description}`);
    }
  
    async put(triples, cb) {
        let triplesLength;
        if (Array.isArray(triples)) {
            await this._model.bulkCreate(triples);
            triplesLength = triples.length;
        }
        else {
            await this._model.create(triples);
            triplesLength = 1;
        }
        console.log(`put ${triplesLength} triples at ${this.description}`);
        cb();
    }

    async get(triple, limit, offset) {
        let result = await this._model.findAll({
                    where: triple,
                    limit: limit,
                    offset: offset,
                    raw: true,
                })
        return result;
    }

    async count(triple) {
        let result = await this._model.count({where: triple})
        return(result);
    }
  
}