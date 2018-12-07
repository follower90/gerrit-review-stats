const fs = require('fs')
const fetch = require('node-fetch')

const settings = JSON.parse(fs.readFileSync('./config.json', 'utf8'))
const score = []

const PROJECT = process.argv[2]
const AGE = process.argv[3]

console.log(`Fetching for ${PROJECT} by age ${AGE}`)

const fetch_data = endpoint => fetch(settings.url + endpoint , {
	credentials: 'include',
	method: 'GET',
	headers: { 'Cookie':  settings.cookie }
})
.then(res => res.text())
.then(text => JSON.parse(text.replace(')]}\'', '')))

const calc_reviews_for_gerrit = gerrit_details => gerrit_details['messages'].reduce((reviewed, message) => {
	const author = message.author ? message.author.name : false
	const text = message.message
	if (settings.team.includes(author) && !reviewed[author] && 
		(text.includes('comment') || text.includes('Code-Review')) &&
		author !== gerrit_details.owner.name) {
		score[author] = score[author] ? (score[author] + 1) : 1

		console.log({
			author,
			text,
			gerrit: gerrit_details.subject,
		})

		reviewed[author] = true
	}
	return reviewed
}, {})

fetch_data(`/changes/?q=project:${PROJECT}+-age:${AGE}`)
	.then(response => {
		console.log(`${response.length} gerrits found`)
		return response
			.map(gerrit => `/changes/${gerrit['id']}/detail`)
			.reduce((p, gerrit) => p.then(() => fetch_data(gerrit).then(calc_reviews_for_gerrit)), Promise.resolve())
	})
	.then(() => console.log(score))
