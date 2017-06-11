var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var multer  = require('multer');
var fs = require("fs");

var minesweeper_api = require('./routes/minesweepergo_api');

var app = express();
var port = 8000;
//view engine


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

//session
//app.use(session({secret:"password", resave:false, saveUninitialized:true}));


//app.use('/', index);
app.use('/api', minesweeper_api);

app.listen(port, '0.0.0.0', function(){
    console.log('Server started on port', + port);
})
