const Sequelize = require('sequelize');

const config = {
    logging: false,
    operatorsAliases: false,
    define: {
        timestamps: false,
    }
};

module.exports = new Sequelize('sqlite:db.sql', config);
