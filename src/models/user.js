const Sequelize = require('sequelize');

const sequelize = require('./../sequelize');

const user = sequelize.define('user', {
    id: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    username: Sequelize.STRING,
});

module.exports = user;
