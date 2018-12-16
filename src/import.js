const moment = require('moment');

const settings = require('./settings');
const request = require('./request');
const sequalize = require('./sequelize');

const Gerrit = require('./models/gerrit');
const Review = require('./models/review');
const User = require('./models/user');

sequalize.sync();

const AGE_QUERY = `${settings.search_range.value}${settings.search_range.type}`;
const LIMIT_QUERY = 999999;

const getListEndpointUrl = project => `/changes/?q=project:${project}+-age:${AGE_QUERY}+limit:${LIMIT_QUERY}`;
const getDetailsEndpointUrl = id => `/changes/${id}/detail`;

const importReview = (message, gerrit_id) => {
    if (!message.author) return Promise.resolve();

    const data = {
        id: message.id,
        date: message.date,
        author: message.author._account_id,
        revision: message._revision_number,
        message: message.message,
        gerrit: gerrit_id,
    };

    return Review.findByPk(data.id).then(review => {
        return review ? Promise.resolve() : Review.create(data);
    });
};

const importUser = user => {
    if (!user) return Promise.resolve();

    const data = {
        id: user._account_id,
        name: user.name,
        email: user.email,
        username: user.username,
    };

    return User.findByPk(data.id).then(user => {
        return user ? Promise.resolve() : User.create(data);
    });
};

const importGerrit = gerrit => {
    if (!gerrit.owner) return Promise.resolve();

    const data = {
        id: gerrit.id,
        branch: gerrit.branch,
        change_id: gerrit.change_id,
        status: gerrit.status,
        author: gerrit.owner._account_id,
        subject: gerrit.subject,
        project: gerrit.project,
        created: gerrit.created,
        updated: gerrit.updated,
    };

    return Gerrit.findByPk(data.id).then(gerrit => {
        if (gerrit) {
            return gerrit.update({ status: gerrit.status, subject: gerrit.subject, updated: gerrit.updated });
        } else {
            return Gerrit.create(data);
        }
    });
};

const isGerritUptoDate = (id, updated) => {
    return new Promise(resolve => {
        Gerrit.findByPk(id).then(gerrit => {
            resolve(gerrit && moment(gerrit.updated).utc().isSame(moment(updated).utc()));
        });
    });
};

const importDetails = id =>
    request(getDetailsEndpointUrl(id))
    .then(gerrit => {
        return importGerrit(gerrit).then(() => gerrit.messages.reduce((p, message) => p.then(() =>
            importUser(message.author).then(() => importReview(message, gerrit.id))),
            Promise.resolve()))
        }
    );

const updateGerrit = gerrit => isGerritUptoDate(gerrit.id, gerrit.updated)
    .then(updated => updated ? Promise.resolve() : importDetails(gerrit.id));

const fetchForProject = project => {
    console.log(`Importing gerrits for ${project}...`);
    return request(getListEndpointUrl(project)).then(response => {
        console.log(`${response.length} gerrits found`);
        return response.reduce((p, gerrit) => p.then(() => updateGerrit(gerrit)), Promise.resolve());
    });
};

const fetchAll = projects => projects.reduce((p, project) => p.then(() => fetchForProject(project)), Promise.resolve());

fetchAll(settings.projects).then(() => console.log('Importing finished'));
