const moment = require('moment');

const db = require('./../db');
const settings = require('./../settings');
const constants = require('./../constants');

const index = (req, res) => {
    const params = req.body;

    const from = params.date_from ? moment(params.date_from) : moment();
    const to = params.date_to ? moment(params.date_to) : moment();

    db.get_user_stats(
       from.startOf('day').format(constants.DB_DATE_FORMAT),
       to.endOf('day').format(constants.DB_DATE_FORMAT),
       settings.team,
       stats => {
           db.get_reviews_data(
               from.startOf('day').format(constants.DB_DATE_FORMAT),
               to.endOf('day').format(constants.DB_DATE_FORMAT),
               settings.team,
               reviews => {
                   return res.render('index', {
                       stats,
                       reviews,
                       date_from: from.format(constants.PICKER_DATE_FORMAT),
                       date_to: to.format(constants.PICKER_DATE_FORMAT),
                       projects: settings.projects,
                   });
               });
    });
};

module.exports = {
    index,
};