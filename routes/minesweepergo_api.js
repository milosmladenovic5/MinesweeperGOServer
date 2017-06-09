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
          return res.send("Success");
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
      return res.end(JSON.stringify(array));
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
    .run( 'MATCH (u:User),(o:OnlineUsers) where u.Username = {username} AND u.Password = {password} AND o.NodeId = 1 CREATE UNIQUE (u) - [:ISONLINE] -> (o) return u',{username:username, password:password})
    .then (function (result){
      result.records.forEach(function (record){
          var user = record.get('u');
          console.log(user.properties.Username + " ulogovan!");
          session.close();
          return res.send(user);
      });
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/logout', function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;
 
    var session = driver.session();

    session
    .run( 'MATCH (u:User{Username: {username} }) - [i:ISONLINE] ->(o:OnlineUsers {NodeId:1}) delete i ',{username:username})
    .then (function (result){

        console.log(username + "izlogovan!");
        return res.send("success");
    
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/getUser', function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.username;

    var session = driver.session();

    session
    .run( 'MATCH (u:User {Username:{username}}) return u',{username:username})
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
    .run( 'MATCH (u:User {Username: {username} }) - [:FRIENDS] - (f) - [:ISONLINE] ->() return f',{username : username})
    .then (function (result){
      result.records.forEach(function (record){
        array.push(record.get('f'));
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      console.log(array);
      return res.end(JSON.stringify(array));
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/getOnlineUsers', function(req, res, next){

    var session = driver.session();
    var array = new Array();

    session
    .run( 'MATCH (u:User) - [:ISONLINE] -> () return u', {})
    .then (function (result){
      result.records.forEach(function (record){
        array.push(record.get('u'));
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      console.log(array);
      return res.end(JSON.stringify(array));
    })
    .catch(function (error){
      console.log(error);
    });
});


router.post('/getArena', function(req, res, next){

    var body = JSON.parse(req.body.action);

    var name = body.name;
    console.log("Neko mi trazi arenu - " + name);
    var session = driver.session();
    var array = new Array();

    session
    .run( 'MATCH (a:Arena {Name: {name} }) return a',{name : name})
    .then (function (result){
    result.records.forEach(function (record){
          var arena = record.get('a');      
          session.close();
          console.log("Nekom sam je i dao - " + arena.properties.Name);
          console.log(arena.properties);
          return res.send(arena.properties);
      });
     
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post('/getArenasByDistance', function(req, res, next){


    var body = JSON.parse(req.body.action);

    var latitude = body.latitude;
    var longitude = body.longitude;
    var radius = body.radius;

    console.log("Neko sa " + latitude + " " + longitude + " mi trazi arene u radijusu " + radius);
    var session = driver.session();
    var array = new Array();

    session
    .run( 'MATCH (a:Arena) return a',{ })
    .then (function (result){
      result.records.forEach(function (record){
        var arena = record.get('a').properties;
        distance = getDistanceFromLatLonInM(latitude, longitude, arena.CenterLatitude, arena.CenterLongitude);
        console.log("Arena " + arena.Name + " udaljena : " +  distance + " metara!");
        if(distance <= radius){
           array.push(arena);
        }   
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      console.log(array);
      return res.end(JSON.stringify(array));
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
      'MATCH (n:User), (m:User) WHERE n.Username = {username} AND m.btDevice = {address} CREATE (n) - [r:FRIENDS] -> (m)',
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
      'MATCH (n:User {Username: {username} }) -[f:FRIENDS] - (m:User{BtDevice :{address} }) delete f',
       {username:username, address : address}).then(function (result){
      console.log("ended friendship!!!");
      session.close();
    });

});

router.post('/locationMonitor',  function(req, res, next){
    console.log("dolegnuo rikuest");
    var body = JSON.parse(req.body.action);

    var username = body.username;
    var latitude = body.latitude;
    var longitude = body.longitude;

    console.log(username + " se nalazuva na: " + latitude + "  " + longitude);

      var session = driver.session();

        session
        .run('MATCH (u:User {Username:{username}}) SET u.Latitude = {latitude}, u.Longitude = {longitude} return u',{username:username, latitude:latitude, longitude:longitude})
        .then (function (result){
          session.close();

        })
        .catch(function (error){
          console.log(error);
        });

    session = driver.session();

    var array = [];
    session
    .run(
      'MATCH (n:User {Username: {username} }) -[:FRIENDS] - (m) return m',
       {username:username}).then(function (result){
        result.records.forEach(function (record){
        var user = record.get('m');
        var lat = user.properties.Latitude;
        var lon = user.properties.Longitude;
        var usernm = user.properties.Username;
        var distance = getDistanceFromLatLonInM(latitude, longitude, lat, lon);
        if(distance < 1000){
          var pair = {"Username":usernm, "Distance": distance};
          array.push(pair);
        }
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      console.log(array);
      return res.end(JSON.stringify(array));
    });
});

function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d * 1000;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


module.exports = router;
