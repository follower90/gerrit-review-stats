const moment = require('moment');
const asyncRoute = require('route-async');

const db = require('./../db');
const settings = require('./../settings');
const constants = require('./../constants');

const index = async (req, res) => {
    const params = req.body;

    const from = params.date_from ? moment(params.date_from) : moment();
    const to = params.date_to ? moment(params.date_to) : moment();

    const stats = await db.get_user_stats(
       from.startOf('day').format(constants.DB_DATE_FORMAT),
       to.endOf('day').format(constants.DB_DATE_FORMAT),
       settings.team,
    );

   const reviews = await db.get_reviews_data(
       from.startOf('day').format(constants.DB_DATE_FORMAT),
       to.endOf('day').format(constants.DB_DATE_FORMAT),
       settings.team,
   );

   return res.render('index', {
       stats,
       reviews,
       url: settings.url,
       date_from: from.format(constants.PICKER_DATE_FORMAT),
       date_to: to.format(constants.PICKER_DATE_FORMAT),
       projects: settings.projects,
   });
};

module.exports = {
    index: asyncRoute(index),
};