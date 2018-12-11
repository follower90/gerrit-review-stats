const db = require('./../db');

const create = user => {

    if (!user) return Promise.resolve();

    return db.import_user({
        id: user._account_id,
        name: user.name,
        email: user.email,
        username: user.username,
    });
};

module.exports.create = create;