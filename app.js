//required module
require('dotenv').config();
const express = require('express');
const i18n = require('./i18n');
const bodyParser = require('body-parser');
const crypto = require('crypto'), shasum = crypto.createHash('sha256');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const sticky = require('sticky-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
admin = require('firebase-admin');
app = express();
app.use(cors())
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(i18n);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use("/public", express.static(__dirname + '/public'));

//////////////// port define /////////////////////////////////////
app.set('port', process.env.PORT || 5004);

// var http = require('http').createServer(app).listen(app.get('port'), function () {
//   console.log("Express server listening on port " + app.get('port'));
// });

// socket
const http = require('http').createServer(app); //ajeet

helper = require('./helper/helper');


if (!sticky.listen(http, app.get('port'))) {

    http.once('listening', function () {
        console.log('Server started on port ' + app.get('port'));
    });
}    



//****Database connection mongodb using mongoose */
mongoose.connect('mongodb://localhost/' +  "real", {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true
});

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once("open", function callback() {
    console.log("Db Connected");
});


//all routes
require('./routes/mainRoutes')(app);



