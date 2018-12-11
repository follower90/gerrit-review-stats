const fs = require('fs');
const moment = require('moment');

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db.sql');

const init = () => {
    db.run(fs.readFileSync(__dirname + '/sql/create_gerrits_table.sql', 'utf-8'));
    db.run(fs.readFileSync(__dirname + '/sql/create_messages_table.sql', 'utf-8'));
    db.run(fs.readFileSync(__dirname + '/sql/create_users_table.sql', 'utf-8'));
};

const import_gerrit = ({ id, branch, change_id, status, author, subject, project, created, updated }) => {
    return new Promise(resolve => {
        db.all('SELECT id FROM gerrits WHERE id =?', [id], (err, rows) => {
            const params = [id, branch, change_id, status, author, subject, project, created, updated];
            if (rows.length === 0) {
                db.run("INSERT INTO gerrits VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", params, () => resolve());
            } else {
                db.run("UPDATE gerrits SET status=?, subject=?, updated=? WHERE id = ?", [status, subject, updated, id], () => resolve());
            }
        });
    });
};

const import_user = ({ id, name, email, username }) => {
    return new Promise(resolve => {
        db.all('SELECT id FROM users WHERE id=?', [id], (err, rows) => {
            const params = [id, name, email, username];
            if (rows.length === 0) {
                db.run("INSERT INTO users VALUES (?, ?, ?, ?)", params, () => resolve());
            } else {
                resolve();
            }

        });
    });
};

const import_message = ({ id, date, author, revision, message, gerrit }) => {
    return new Promise(resolve => {
        db.all('SELECT id FROM reviews WHERE id =?', [id], (err, rows) => {
            if (rows.length === 0) {
                const params = [id, date, author, revision, message, gerrit];
                db.run("INSERT INTO reviews VALUES (?, ?, ?, ?, ?, ?)", params, () => resolve());
            } else {
                resolve();
            }
        });
    })

};


const get_user_stats = (date_from, date_to, team, resolve) => {
    const team_in = team.map(i => '?').join(',');

    db.all('SELECT id, name from users WHERE name IN (' + team_in + ')', [...team], (err, users) => {
        db.all('SELECT r.author, r.gerrit, g.project ' +
            'FROM reviews r ' +
            'JOIN gerrits g ON g.id = r.gerrit ' +
            'WHERE r.message LIKE "%: Code-Review%" AND ' +
            'r.date >= ? AND r.date <= ? AND r.author IN (' + team_in + ')', [ date_from, date_to, ...users.map(i => i.id)], (err, rows) => {

            const unique_author_in_gerrit_hash = {};

            const counts = rows.reduce((acc, i) => {

                if (!unique_author_in_gerrit_hash[i.author]) unique_author_in_gerrit_hash[i.author] = [];
                if (unique_author_in_gerrit_hash[i.author].includes(i.gerrit)) return acc;
                unique_author_in_gerrit_hash[i.author].push(i.gerrit);

                if (!acc[i.author]) acc[i.author] = {};
                acc[i.author]['total'] = acc[i.author]['total'] ? acc[i.author]['total'] + 1 : 1;

                if (!acc[i.author]['projects']) acc[i.author]['projects'] = {};
                acc[i.author]['projects'][i.project] =  acc[i.author]['projects'][i.project] ? acc[i.author]['projects'][i.project] + 1 : 1;


                return acc;
            }, {});

            const result = users.map(user => ({
                name: user.name,
                count: counts[user.id] ? counts[user.id]['total'] : 0,
                projects: counts[user.id] ? counts[user.id]['projects'] : {},
             })).sort((a,b) => (a.count > b.count) ? -1 : 1);
            resolve(result);
        });
    });
};

const get_reviews_data = (date_from, date_to, team, resolve) => {
    const team_in = team.map(i => '?').join(',');

    db.all('SELECT id, name from users WHERE name IN (' + team_in + ')', [...team], (err, users) => {
        db.all('SELECT r.date, r.author, r.message, g.subject, g.project FROM reviews r ' +
            'JOIN gerrits g ON g.id = r.gerrit ' +
            'WHERE r.message LIKE "%: Code-Review%" AND r.date >= ? AND r.date <= ? AND r.author IN (' + team_in + ') ' +
            'GROUP BY r.author, r.gerrit ' +
            'ORDER BY r.date',
            [ date_from, date_to, ...users.map(i => i.id)], (err, rows) => {

            const authors = users.reduce((acc, i) => {
                acc[i.id] = i.name;
                return acc;
            }, {});

            const result = rows.map(row => ({
                date: moment(row.date).format('MM/DD/YYYY'),
                name: authors[row.author],
                message: row.message,
                gerrit: row.subject,
                project: row.project,
            }));

            resolve(result);
        });
    });
};

const get_gerrit = (id, resolve) => {
    db.all('SELECT * FROM gerrits where id = ?', [id], (err, rows) => {
        resolve(rows[0]);
    });
};

module.exports = {
    init,
    get_gerrit,

    import_gerrit,
    import_user,
    import_message,

    get_user_stats,
    get_reviews_data,
};
