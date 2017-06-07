var express  = require('express');
var neo4j = require('neo4j-driver').v1;
var router  = express.Router();
var multer  = require('multer');

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "newbase"));

var upload = multer({dest:'./public/images/'});

router.post('/imageUpload', upload.single('pic'), function (req, res) {
        var filename = '/images/'+ req.file.filename;

        var session = driver.session();

         session
        .run('MATCH (u:User {Username:{username}}) SET u.ImageURL = {filename} return u',{username:req.body.username, filename:filename})
        .then (function (result){
          session.close();
          res.send("Success");
        })
        .catch(function (error){
          console.log(error);
        });

});

router.post('/getAllUsernames', function(req, res, next){

    var session = driver.session();
    var array = new Array();

    session
    .run( 'MATCH (u:User) return u.Username',{})
    .then (function (result){
      result.records.forEach(function (record){
        array.push(record.get('u.Username'));
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify(array));
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/register',  function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;
    var password = body.password;
    var email = body.email;
    var phoneNumber = body.phonenumber;
    var firstName = body.firstname;
    var lastName = body.lastname;
    var imageURL = "/images/ud.jpg"
    var btDevice = body.btDevice;

    var session = driver.session();
    console.log("Registration called");
    console.log(body);

    session
    .run(
      'CREATE (user:User {Username: {username}, Password: {password}, Email: {email}, FirstName: {firstName}, LastName: {lastName}, PhoneNumber: {phoneNumber}, ImageURL :{imageURL}, BtDevice:{btDevice} })',
       {username:username, password:password, email:email, firstName:firstName, lastName:lastName, phoneNumber:phoneNumber, imageURL : imageURL, btDevice: btDevice})
    .then(function (result){
      console.log("successful registration");
      session.close();
    });

});

router.post('/login', function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;
    var password = body.password;

    var session = driver.session();

    session
    .run( 'MATCH (u:User {Username:{username}, Password:{password}}) return u',{username:username, password:password})
    .then (function (result){
      result.records.forEach(function (record){
          var user = record.get('u');
          console.log(user);
          session.close();
          //res.writeHead(200, {"Content-Type": "application/json"});
          // res.end(JSON.stringify(user));
          return res.send(user);
      });
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/getUser', function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;
    var password = body.password;

    var session = driver.session();

    session
    .run( 'MATCH (u:User {Username:{username} return u',{username:username, password:password})
    .then (function (result){
      result.records.forEach(function (record){
          var user = record.get('u');
          console.log(user);
          session.close();
          return res.send(user);
      });
    })
    .catch(function (error){
      console.log(error);
    });
});


router.post('/getFriends', function(req, res, next){

    var body = JSON.parse(req.body.action);

    var username = body.username;

    var session = driver.session();
    var array = new Array();

    session
    .run( 'MATCH (u:User {Username: {username} }) -> [:FRIENDS] ->(o) return o',{username : username})
    .then (function (result){
      result.records.forEach(function (record){
        array.push(record.get('o'));
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      res.end(JSON.stringify(array));
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/startFriendship',  function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;
    var address = body.address;

    var session = driver.session();
    console.log(username + "<-FRIENDS->" + address);

    session
    .run(
      'MATCH (n:User), (m:User) WHERE n.Username = {username} AND m.btDevice = {address} CREATE (n) <- [r:FRIENDS] -> (m)',
       {username:username, address : address})
    .then(function (result){
      console.log("success!!!");
      session.close();
    });

});

router.post('/endFriendship',  function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;
    var address = body.address;

    var session = driver.session();
    console.log(username + "<-FRIENDS->" + address);

    session
    .run(
      'MATCH (n:User {Username: {username} }) <-[:FRIENDS] -> (m:User{BtDevice :{address} })',
       {username:username, address : address}).then(function (result){
      console.log("ended friendship!!!");
      session.close();
    });

});


module.exports = router;
