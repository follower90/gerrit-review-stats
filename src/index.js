const moment = require('moment');

const settings = require('./settings');
const request = require('./request');

const score = [];

const is_author_in_team = author => settings.team.includes(author);
const is_code_review = text => text.includes('comment') || text.includes('Code-Review');
const is_own_gerrit = (author, gerrit) => author === gerrit.owner.name;

const is_out_of_search_range = message => {
	const date = moment(message.date);
	const min_date = moment().subtract(settings.search_range.value, settings.search_range.type);
	return date < min_date;

}
const calculate_reviews = gerrit => {

	return gerrit['messages'].reduce((reviewed, message) => {

		if (!is_out_of_search_range(message)) {

			const author = message.author ? message.author.name : false;
			const text = message.message;

			if (!reviewed[author] && is_author_in_team(author) &&
				!is_own_gerrit(author, gerrit) && is_code_review(text)) {

					console.log(JSON.stringify({
						date: moment(message.date).format('YYYY/MM/DD'),
						reviewer: author,
						message: text,
						gerrit: gerrit.subject,
					}));

					score[author] = score[author] ? (score[author] + 1) : 1;
					reviewed[author] = true;
			}
		}

		return reviewed;
	}, {});
};


const fetch_gerrits = project => {

	console.log(`Fetching gerrits for ${project}...`);

	const age = `${settings.search_range.value}${settings.search_range.gerrit_type}`;
	const url = `/changes/?q=project:${project}+-age:${age}`;

	return request(url).then(response => {

		console.log(`${response.length} gerrits found`);

		return response
			.map(gerrit => `/changes/${gerrit['id']}/detail`)
			.reduce((p, gerrit) => {
				return p.then(() => request(gerrit).then(calculate_reviews));
			}, Promise.resolve());
	});
};

const fetch_stats = () => {
	return settings.projects.reduce((p, project) => {
		return p.then(() => fetch_gerrits(project));
	}, Promise.resolve());
};

fetch_stats().then(() => {
	console.log('Result score:');
	console.log(score);
});
