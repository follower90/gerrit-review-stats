const fs = require('fs');

const settings = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

module.exports = settings;