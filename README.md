# Gerrit Review Stats v.1.0.6

### Features
- Get reviews count with log of review messages
- Filter by group of team members and multiple projects
- Filter by date in UI

### Web interface

![alt text](screenshot.jpg)

### Set-up and run
- Setup your config.json from example (you should copy cookie from your browser)
- Run `yarn run import` to import in local SQLite (it will create db.sql file)
- Run `yarn start` to run review statistics on localhost:3333

### Changelog

##### 1.0.6

- Minor template updated and favicon added
- Update to not calculate self +1
- Use yarn as package manager

##### 1.0.5

- Removed raw queries and manual table create scripts
- Sequelize package used for queries and database
- Updated bootstrap layout

##### 1.0.4

- SQLite db added to preserve imported data
- Import speed optimized
- Web UI added

##### 1.0.3

- Multiple projects support

##### 1.0.0

- Single-file script to fetch stats and console output