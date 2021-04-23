var express = require('express');
require('./config/database')
var path = require('path');
var logger = require('morgan');

var newsRouter = require('./routes/news');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/news', newsRouter);

module.exports = app;
