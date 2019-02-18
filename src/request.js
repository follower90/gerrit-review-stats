const fetch = require('node-fetch');

const settings = require('./settings');

const request = async endpoint => {
	const params = {
		credentials: 'include',
		method: 'GET',
		headers: { 'Cookie': settings.cookie },
	};

	const response = await fetch(settings.url + endpoint, params);
	const text = await response.text();

	return JSON.parse(text.replace(')]}\'', ''));
};

module.exports = request;