const Sequelize = require('sequelize');


module.exports = function (sequelize, DataTypes, params) {
    let columnConfig = { type: Sequelize.TEXT('medium') }
    let indexes = [];
    if (sequelize.options.dialect == 'sqlite') indexes = [];
    else if (sequelize.options.dialect == 'mysql') {
        indexes = [
            { 
                name: 'uri',
                method: 'HASH',
                fields: [ { attribute: 'uri', length: 255} ],
                unique: true,
            },
        ]
    };

    return sequelize.define(params.table, 
        {
            uri: {
                type: DataTypes.TEXT('medium'),
                allowNull: false,
            }
        },
        {
            indexes: indexes,
        }
    );
}



