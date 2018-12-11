const express = require('express');
const bodyParser = require('body-parser');

const indexController = require('./controllers/index');

const app = express();

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', indexController.index);
app.post('/', indexController.index);

app.listen(3333);