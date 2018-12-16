const Sequelize = require('sequelize');
const sequelize = require('./../sequelize');

const Gerrit = sequelize.define('gerrit', {
    id: { type: Sequelize.STRING, primaryKey: true },
    branch: Sequelize.STRING,
    change_id: Sequelize.STRING,
    status: Sequelize.STRING,
    author: Sequelize.STRING,
    subject: Sequelize.STRING,
    project: Sequelize.STRING,
    created: Sequelize.DATE,
    updated: Sequelize.DATE,
});

module.exports = Gerrit;
