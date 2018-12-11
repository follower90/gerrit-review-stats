const db = require('./../db');

const create = gerrit => {

    if (!gerrit.owner) return Promise.resolve();

    return db.import_gerrit({
        id: gerrit.id,
        branch: gerrit.branch,
        change_id: gerrit.change_id,
        status: gerrit.status,
        author: gerrit.owner._account_id,
        subject: gerrit.subject,
        project: gerrit.project,
        created: gerrit.created,
        updated: gerrit.updated,
    });
};

module.exports.create = create;