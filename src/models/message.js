const db = require('./../db');

const create = (message, gerrit_id) => {

    if (!message.author) return Promise.resolve();

    return db.import_message({
        id: message.id,
        date: message.date,
        author: message.author._account_id,
        revision: message._revision_number,
        message: message.message,
        gerrit: gerrit_id,
    });
};

module.exports.create = create;