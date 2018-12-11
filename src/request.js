const fetch = require('node-fetch');

const settings = require('./settings');

const request = endpoint => {
	const params = {
		credentials: 'include',
		method: 'GET',
		headers: { 'Cookie': settings.cookie },
	};

	return fetch(settings.url + endpoint, params)
		.then(res => res.text())
		.then(text => JSON.parse(text.replace(')]}\'', '')));
};

module.exports = request;