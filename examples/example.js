let { DB, Parser } = require('../index');

let db = new DB({
    dialect: 'mysql',
    // dialect: 'sqlite',
    database: 'ldf',
    table: 'test',
    host: '172.17.4.14',
    port: 3306,
    // storage: __dirname + '/data.sqlite',
    username: 'root',
    password: 'root',
})

async function parse() {
    let parser = new Parser();
    let msg = await Promise.all([
        parser.parseAndSave({file: './orgf.hdt', db: db, readerLimit: 20000, dropTable: true}),
        // parser.parseAndSave({file: './examples/test.ttl', db: db, readerLimit: 20000, dropTable: true}),
    ])
    console.log('!!!!!!!!!!!msg', msg)
    db.close();
}

async function create() {
    let triples = [

    {subject: "s1", predicate: "p1", object: "o1"},
    {subject: "s1", predicate: "p2", object: "o3"},
    {subject: "s1", predicate: "p2", object: "o3"},
    {subject: "s2", predicate: "p2", object: "o2"},
    {subject: "s3", predicate: "p3", object: "o3"},
    {subject: "s3", predicate: "p2", object: "o1"},
    {subject: "s4", predicate: "p4", object: "o4"},
    {subject: "s5", predicate: "p5", object: "o5"},
    {subject: "s6", predicate: "p6", object: "o6"},
    {subject: "s7", predicate: "p7", object: "o7"},
    {subject: "s8", predicate: "p8", object: "o8"},
    {subject: "s9", predicate: "p9", object: "o9"},
    {subject: "s10", predicate: "p10", object: "o10"},
    {subject: "s21", predicate: "p1", object: '"заговорен"@ru'},
    {subject: "s22", predicate: "p1", object: '"заговорен"@ru'},
    {subject: "s23", predicate: "p1", object: '"заговорен"@ru'},
    {subject: "s23", predicate: "p1", object: '"заговорен"@ru'},

    ]
    let triple = {
        subject: 'subjectOne',
        predicate: 'predicateOne',
        object: 'objectOne'
    }

    await db.authenticate();
    await db.drop();
    await db.createTable();
    await db.put(triples);
    await db.put(triples);
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