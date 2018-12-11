const settings = require('./settings');
const request = require('./request');
const db = require('./db');

const Gerrit = require('./models/gerrit');
const Message = require('./models/message');
const User = require('./models/user');

const gerrit_is_uptodate = id => {
    return new Promise(resolve => {
        db.get_gerrit(id, row => resolve(row));
    });
};

db.init();

const fetch_gerrit_details = gerrit => {
    return Gerrit.create(gerrit).then(() => {
        return gerrit.messages.reduce((p, message) => {
            return p.then(() => {
                return Message.create(message, gerrit.id).then(() => {
                    return User.create(message.author);
                });
            });
        }, Promise.resolve());
    });
};

const fetch_gerrits = project => {

    console.log(`Importing gerrits for ${project}...`);

    const age = `${settings.search_range.value}${settings.search_range.gerrit_type}`;
    const url = `/changes/?q=project:${project}+-age:${age}+limit:999999`;

    return request(url).then(response => {

        console.log(`${response.length} gerrits found`);

        return response
            .reduce((p, gerrit) => {
                return p.then(() => {
                    return gerrit_is_uptodate(gerrit.id).then(row => {
                        if (!row) return true;
                        if (row.updated !== gerrit.updated) return true;
                        return false;
                    }).then(need_refetch => {
                        return need_refetch
                            ? request(`/changes/${gerrit['id']}/detail`).then((gerrit) => {
                                return fetch_gerrit_details(gerrit);
                            })
                            : Promise.resolve();
                    });
                });
            }, Promise.resolve());
    });
};

const fetch_stats = () => {
    return settings.projects.reduce((p, project) => {
        return p.then(() => fetch_gerrits(project));
    }, Promise.resolve());
};

fetch_stats().then(() => {
    console.log('Finished.');
});
