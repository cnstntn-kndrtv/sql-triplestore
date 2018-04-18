let { DB, Parser } = require('../index');

let db = new DB({
    dialect: 'mysql',
    // dialect: 'sqlite',
    database: 'ldf',
    table: 'test',
    host: '172.17.4.14',
    port: 3306,
    storage: __dirname + '/data.sqlite',
    username: 'root',
    password: 'root',
})

async function parse() {
    let parser = new Parser();
    let msg = await Promise.all([
        parser.parseAndSave({file: './test.hdt', db: db, readerLimit: 5, dropTable: true}),
        // parser.parseAndSave({file: './test.ttl', db: db, readerLimit: 5, dropTable: true}),
    ])
    console.log('!!!!!!!!!!!msg', msg)
    db.close();
}

async function create() {
    let triple = {
        subject: 'subjectOne',
        predicate: 'predicateOne',
        object: 'objectOne'
    }
    await db.authenticate();
    await db.drop();
    await db.createTable();
    await db.put(triple);
    db.close();
}

async function find() {
    let triple = {
        // subject: 'http://ex.ru#s1',
        // predicate: 'http://ex.ru#p1',
        // object: 'http://ex.ru#o1'
    }
    await db.authenticate();
    let result = await db.get(triple)
    console.log('r=', result)
    db.close()
}

async function count() {
    let triple = {
        subject: 'http://ex.ru#s1',
        // predicate: 'http://ex.ru#p1',
        // object: 'http://ex.ru#o1'
    }
    await db.authenticate();
    let result = await db.count(triple)
    console.log('r=', result)
    db.close()
}

parse()
// create()
// find()
// count()