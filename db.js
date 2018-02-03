const Sequelize = require('sequelize');
const config = require('./config/config');
const uuid=require('node-uuid');

console.log('init sequelize...');

function generateId() {
    return uuid.v4()
}

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 30000
    }
});

const ID_TYPE = Sequelize.STRING(50);

function defineModel(name, attributes) {
    let attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            }
        }
    }
    attrs.id = {
        type: ID_TYPE,
        primaryKey: true
    };
    attrs.createAt = {
        type: Sequelize.BIGNT,
        allowNull: false
    };
    attrs.updateAt = {
        type: Sequelize.BIGNT,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGNT,
        allowNull: false
    };
    return sequelize.define(name, attrs, {
        tableName: name,
        timestamps: false,
        hooks: {
            beforeValidate: function (obj) {
                let now = Date.now();
                if (obj.isNewRecord) {
                    if (!obj.id) {
                        obj.id = generateId();
                    }
                    obj.createAt = now;
                    obj.updateAt = now;
                    obj.version = 0;
                } else {
                    obj.updateAt =now;
                    obj.version++;
                }
            }
        }
    })

}
const TYPES=['STRING','INTEGER','BIGINT','TEXT','DOUBLE','DATEONLY','BOOLEAN'];

let exp={
    defineModel:defineModel,
    sync: ()=>{
        if(process.nev.NODE_ENV !== 'production'){
            sequelize.sync({force:true});
        } else {
            throw new Error('Cannot sync() when NODE_EVN is set to \'production\'.');
        }
    }
};

for (let type of TYPES){
    exp[type]=Sequelize[type];
}

exp.ID=ID_TYPE;
exp.generateId=generateId;

module.exports=exp;