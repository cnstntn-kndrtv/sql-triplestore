const Op = require('sequelize').Op;

module.exports = function (sequelize, DataTypes, params) {
    
    async function getId(uri, type) {
        uri = escape(uri);
        let assist = params.assistModels[type];
        let result = await assist.findOne({where: {uri: uri}})
        let id = result.id
        return id;
    }

    async function getUri(id, type) {
        let assist = params.assistModels[type];
        let result = await assist.findOne({where: {id: id}})
        let uri = unescape(result.uri);
        return uri;
    }

    async function getOrCreateId(uri, type) {
        uri = escape(uri);
        let assist = params.assistModels[type];
        let id = await assist.findOrCreate({where: {uri: uri}})
            .spread((result, created) => {
                return result.id;
            })
        return id;

    }

    async function getOrCreateIdBulk(uris, type) {
        let uriArray = [];
        for (let uri in uris) {
            if (!uriArray.includes(uri)) uriArray.push(uri);
        }
        let assist = params.assistModels[type];
        await assist
            .findAll({
                where: { uri: uriArray }
            })
            .then((res) => {
                let newEntries = [];
                let uriArrayLength = uriArray.length;

                if (res.length > 0) {
                    for ( let i = 0; i < uriArrayLength; i++ ) {
                        let u = uriArray[i];
                        if (!includesUri(u, res)) newEntries.push({uri: u});
                    }
                }
                else {
                    for ( let i = 0; i < uriArrayLength; i++ ) {
                        newEntries.push({uri: uriArray[i]})
                    }
                }
                return newEntries;
            })
            .then((newEntries) => {
                if (newEntries.length > 0) {
                    return assist.bulkCreate(newEntries);
                }
                else return
            })
            .then(() => {
                return assist
                    .findAll({where: {uri: uriArray}})
            })
            .then((res) => {
                let l = res.length;
                for (let i = 0; i < l; i++) {
                    let r = res[i];
                    uris[r.uri] = r.id;
                }
            })
        return uris;
    }

    async function bulkSetter(triples, options) {
        triples = escapeTriples(triples);
        let subjects = {};
        let predicates = {};
        let objects = {};
        let l = triples.length;
        for (let i = 0; i < l; i++) {
            let t = triples[i];
            if (!subjects.hasOwnProperty[t.subject]) subjects[t.subject] = null;
            if (!predicates.hasOwnProperty[t.predicate]) predicates[t.predicate] = null;
            if (!objects.hasOwnProperty[t.object]) objects[t.object] = null;
        }

        subjects = await getOrCreateIdBulk(subjects, 'subject');
        predicates = await getOrCreateIdBulk(predicates, 'predicate');
        objects = await getOrCreateIdBulk(objects, 'object');

        for (let i = 0; i < l; i++) {
            let t = triples[i];
            t.subject = subjects[t.subject];
            t.predicate = predicates[t.predicate];
            t.object = objects[t.object];
        }
        
    }

    async function setter(triple, options) {
        triple.subject = await getOrCreateId(triple.subject, 'subject');
        triple.predicate = await getOrCreateId(triple.predicate, 'predicate');
        triple.object = await getOrCreateId(triple.object, 'object');
    }

    async function beforeFind(params) {
        if (params.where.subject) params.where.subject = await getId(params.where.subject, 'subject');
        if (params.where.predicate) params.where.predicate = await getId(params.where.predicate, 'predicate');
        if (params.where.object) params.where.object = await getId(params.where.object, 'object');
    }

    async function afterFind(results, query) {
        let resLength = results.length;
        if (resLength != 0) {
            for (let i = 0; i < resLength; i++) {
                let r = results[i];
                r.subject = await getUri(r.subject, 'subject');
                r.predicate = await getUri(r.predicate, 'predicate');
                r.object = await getUri(r.object, 'object');
            }
        }
    }

    async function beforeCount(params) {
        if (params.where.subject) params.where.subject = await getId(params.where.subject, 'subject');
        if (params.where.predicate) params.where.predicate = await getId(params.where.predicate, 'predicate');
        if (params.where.object) params.where.object = await getId(params.where.object, 'object');
    }
    
    function escapeTriples(triples) {
        let l = triples.length;
        for(let i = 0; i < l; i++) {
            let t = triples[i];
            t.subject = escape(t.subject);
            t.predicate = escape(t.predicate);
            t.object = escape(t.object);
        }
        return triples;
    }

    function escape(str) {
        if (typeof(str) == 'string') {
            str = str.replace(/"/g, '\\"');
            str = str.replace(/'/g, "\\'");
        }
        return (str)
    }

    function unescape(str) {
        if (typeof(str) == 'string') {
            str = str.replace(/\\"/g, '"');
            str = str.replace(/\\'/g, "'");
        }
        return (str)
    }

    function includesUri(uri, res) {
        let resLength = res.length;
        let includes = false;
        for ( let i = 0; i < resLength; i++ ) {
            if (res[i].uri == uri) {
                includes = true;
                break;
            }
        }
        return includes;
    }
    
    return sequelize.define(params.table, 
        {
            subject: { 
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            predicate: { 
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            object: { 
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            indexes: [
                // unique: true
                { name: 'spo', fields: [ {attribute: 'subject'}, {attribute: 'predicate'}, {attribute: 'object'} ] },
                { name: 'sop', fields: [ {attribute: 'subject'}, {attribute: 'object'}, {attribute: 'predicate'} ] },
                { name: 'pso', fields: [ {attribute: 'predicate'}, {attribute: 'subject'}, {attribute: 'object'} ] },
                { name: 'pos', fields: [ {attribute: 'predicate'}, {attribute: 'object'}, {attribute: 'subject'} ] },
                { name: 'ops', fields: [ {attribute: 'object'}, {attribute: 'predicate'}, {attribute: 'subject'} ] },
                { name: 'osp', fields: [ {attribute: 'object'}, {attribute: 'subject'}, {attribute: 'predicate'} ] },
            ],
            hooks: {
                beforeBulkCreate: bulkSetter,
                beforeCreate: setter,
                beforeFind: beforeFind,
                afterFind: afterFind,
                beforeCount: beforeFind,
            }
        }
            
    );

};