const moment = require('moment');
const Sequelize = require('sequelize');

const Gerrit = require('./models/gerrit');
const Review = require('./models/review');
const User = require('./models/user');

const Op = Sequelize.Op;

const get_user_stats = (date_from, date_to, team, resolve) => {
    User.findAll({ where: { name: { [Op.in]: team } } }).then(users => {
        Review.findAll({
            where: {
                date: { [Op.between]: [date_from, date_to] },
                message: { [Op.like]: '%: Code-Review%' },
                author: { [Op.in]: users.map(i => i.id), [Op.not]: Sequelize.col('parent.author') },
            },
            include: [
                { model: Gerrit, as: 'parent' },
                { model: User, as: 'user' }
             ]}).then(rows => {

            const unique_author_in_gerrit_hash = {};

            const counts = rows.reduce((acc, i) => {
                const author = i.user.name;
                const project = i.parent.project;

                if (!unique_author_in_gerrit_hash[author]) unique_author_in_gerrit_hash[author] = [];
                if (unique_author_in_gerrit_hash[author].includes(i.gerrit)) return acc;
                unique_author_in_gerrit_hash[author].push(i.gerrit);

                if (!acc[author]) acc[author] = {};
                acc[author]['total'] = acc[author]['total'] ? acc[author]['total'] + 1 : 1;

                if (!acc[author]['projects']) acc[author]['projects'] = {};
                acc[author]['projects'][project] =  acc[author]['projects'][project] ? acc[author]['projects'][project] + 1 : 1;

                return acc;
            }, {});

            const result = users.map(user => ({
                name: user.name,
                count: counts[user.name] ? counts[user.name]['total'] : 0,
                projects: counts[user.name] ? counts[user.name]['projects'] : {},
            })).sort((a,b) => (a.count > b.count) ? -1 : 1);

            resolve(result);
        });
    });
};

const get_reviews_data = (date_from, date_to, team, resolve) => {
    Review.findAll({
        where: {
            date: { [Op.between]: [date_from, date_to] },
            message: { [Op.like]: '%: Code-Review%' },
            author: { [Op.not]: Sequelize.col('parent.author') },
        },
        include: [
            { model: Gerrit, as: 'parent' },
            { model: User, as: 'user', where: { name: { [Op.in]: team } } }
        ],
        group: ['review.author', 'review.gerrit'],
        order: [['date', 'asc']],
        }).then(rows => {
            const result = rows.map(row => ({
                date: moment(row.date).format('MM/DD/YYYY'),
                name: row.user.name,
                message: row.message,
                subject: row.parent.subject,
                change_id: row.parent.change_id,
                project: row.parent.project,
            }));

            resolve(result);
    });
};

module.exports = {
    get_user_stats,
    get_reviews_data,
};
