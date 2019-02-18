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

const importReview = async (message, gerrit_id) => {
    if (!message.author) return;

    const data = {
        id: message.id,
        date: message.date,
        author: message.author._account_id,
        revision: message._revision_number,
        message: message.message,
        gerrit: gerrit_id,
    };

    const review = await Review.findByPk(data.id);
    if (!review) await Review.create(data);
};

const importUser = async user => {
    if (!user) return;

    const data = {
        id: user._account_id,
        name: user.name,
        email: user.email,
        username: user.username,
    };

    const userDb = await User.findByPk(data.id);
    if (!userDb) await User.create(data);
};

const importGerrit = async gerrit => {
    if (!gerrit.owner) return;

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

    const gerritDb = await Gerrit.findByPk(data.id);
    if (gerritDb) {
        await gerritDb.update({ status: gerrit.status, subject: gerrit.subject, updated: gerrit.updated });
    } else {
        await Gerrit.create(data);
    }
};

const isGerritUptoDate = async (id, updated) => {
    const gerrit = await Gerrit.findByPk(id);
    return gerrit && moment(gerrit.updated).utc().isSame(moment(updated).utc());
};

const importDetails = async id => {
    const gerrit = await request(getDetailsEndpointUrl(id));
    await importGerrit(gerrit);

    for (const message of gerrit.messages) {
        await importUser(message.author);
        await importReview(message, gerrit.id);
    }
};

const updateGerrit = async gerrit => {
    const updated = await isGerritUptoDate(gerrit.id, gerrit.updated);
    if (!updated) await importDetails(gerrit.id);
};

const fetchForProject = async project => {
    console.log(`Importing gerrits for ${project}`);
    const response = await request(getListEndpointUrl(project));
    console.log(`${response.length} gerrits found`);

    for (const gerrit of response) await updateGerrit(gerrit);
};

const fetchAll = async projects => {
    for (const project of projects) await fetchForProject(project);
};

fetchAll(settings.projects);
