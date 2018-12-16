const Sequelize = require('sequelize');

const sequelize = require('./../sequelize');
const Gerrit = require('./gerrit');
const User = require('./user');

const Review = sequelize.define('review', {
    id: { type: Sequelize.STRING, primaryKey: true },
    date: Sequelize.DATE,
    author: Sequelize.STRING,
    revision: Sequelize.STRING,
    message: Sequelize.STRING,
    gerrit: Sequelize.STRING,
});

Review.belongsTo(Gerrit, { foreignKey: 'gerrit', as: 'parent' });
Review.belongsTo(User, { foreignKey: 'author', as: 'user' });

module.exports = Review;
