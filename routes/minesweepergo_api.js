var express  = require('express');
var neo4j = require('neo4j-driver').v1;
var router  = express.Router();
var multer  = require('multer');

//var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "newbase"));

// password je nemoguce povratiti - oPRIJEZ MUJO
var driver = neo4j.driver("bolt://hobby-knmkakkmojekgbkecndlckpl.dbs.graphenedb.com:24786", neo4j.auth.basic("admin", "b.obEHYZ3nIFJm.q8fSiEw2pwxbwnik"));


var upload = multer({dest:'./public/images/'});

router.get('/test',  function(req, res, next){

    var username = "Mujo";
    var password = "booosanac";
    var email = "volemAlaha@gmail.com";
    var phoneNumber = "bosna";
    var firstName = "Fihret";
    var lastName = "Karakutrtovic";
    var imageURL = "/images/ud.jpg"
    var btDevice = "kek";

    var session = driver.session();
    console.log("Registration called");


    session
    .run(
      'CREATE (user:User {Username: {username}, Password: {password}, Email: {email}, FirstName: {firstName}, LastName: {lastName}, PhoneNumber: {phoneNumber}, ImageURL :{imageURL}, BtDevice:{btDevice} })',
       {username:username, password:password, email:email, firstName:firstName, lastName:lastName, phoneNumber:phoneNumber, imageURL : imageURL, btDevice: btDevice})
    .then(function (result){
      console.log("successful registration");
      session.close();
    });

});



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

        console.log(username + " izlogovan!");
        return res.send("success");
    
    })
    .catch(function (error){
      console.log(error);
    });
});

router.get('/some', function(req, res,next){
  console.log("I did it again");

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

        // var upRight = gis.createCoord([arena.CenterLatitude,arena.CenterLongitude], 45, arena.Radius);
        // var upLeft = gis.createCoord([arena.CenterLatitude,arena.CenterLongitude], 135, arena.Radius);
        // var bottomleft = gis.createCoord([arena.CenterLatitude,arena.CenterLongitude], 235,arena.Radius);
        // var bottomRight = gis.createCoord([arena.CenterLatitude,arena.CenterLongitude],325, arena.Radius);

        // console.log("UpperRight" + upRight);
        // console.log("UpperLeft" + upLeft);
        // console.log("bottomleft" + bottomleft);
        // console.log("bottomRight" + bottomRight);
    

        // console.log("Arena " + arena.Name + " udaljena : " +  distance + " metara!");
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

    console.log("Friendship call started");
    

    var username = body.username;
    var address = body.address;

    var session = driver.session();
    console.log(username + "<-FRIENDS->" + address);

    session
    .run(
      'MATCH (n:User), (m:User) WHERE n.Username = {username} AND m.BtDevice = {address} CREATE (n) - [r:FRIENDS] -> (m)',
       {username:username, address : address})
    .then(function (result){
      console.log("success!!!");
      session.close();
      res.end();
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
      'MATCH (n:User {Username: {username} }) -[f:FRIENDS] - (m:User {BtDevice :{address} }) delete f',
       {username:username, address : address}).then(function (result){
      console.log("ended friendship!!!");
        session.close();
        res.end();
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

router.post('/getArenaGames', function(req, res, next){
    var body = JSON.parse(req.body.action);

    var arenaName = body.arenaName; 

    var session = driver.session();
    var array = new Array();
    session
    .run( 'MATCH (a:Arena {Name: {arenaName} }) - [:HASGAME] ->(g) return g',{arenaName:arenaName })
    .then (function (result){
      result.records.forEach(function (record){
        var game = record.get('g').properties;
           array.push(game); 
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

router.post('/createGame',  function(req, res, next){
    var body = JSON.parse(req.body.action);

    var username = body.creatorUsername;
    var arenaName = body.arenaName;

    var session = driver.session();
    
    session
    .run('MATCH (gameId:GameId) SET gameId.Value=gameId.Value+1 return gameId.Value')
    .then(function(result){
        result.records.forEach(function (record){
        var idValue = parseInt(record.get('gameId.Value'));

        session
        .run(
          'MATCH (arena:Arena {Name: {arenaName} }) CREATE (game:Game {CreatorUsername: {username}, GameId: {gameId}}) <- [r:HASGAME] - (arena)',
          {arenaName:arenaName, username:username, gameId:idValue})
        .then(function (result){
          console.log("Successful game creation.");  
          session.close();
          
          var gameId = {gameId:idValue};
          return res.send(gameId);
         });
      });
  });
});


router.post("/addMines", function(req, res, next){
    var body = JSON.parse(req.body.action);

    console.log(body);
    var gameId = body.gameId;
    var minesArray = JSON.stringify(body.minesArray);

    var session = driver.session();

    session
    .run('MATCH (game:Game {GameId:{gameId}}) SET game.Mines = {mines}', {gameId:gameId, mines:minesArray})
    .then(function(result){
        console.log("Successfully added mines.");
        res.send("nedam ti nista");

    }).catch(function (error){
      console.log(error);
    });   
});

router.post("/getGame", function(req, res, next){
    var body = JSON.parse(req.body.action);

    var gameId = body.gameId;
    console.log("Neko oce gejm: " + gameId);
    
    var session = driver.session();
    var array = new Array();
    session
    .run( 'MATCH (g:Game {GameId: {gameId} }) return g',{gameId:gameId })
    .then (function (result){
      result.records.forEach(function (record){
        var game = record.get('g').properties;
           array.push(game); 
      });
      session.close();
      res.writeHead(200, {"Content-Type": "application/json"});
      console.log(array);   // GRESKA ALI MILOSA MRZI DA MENJA
      return res.end(JSON.stringify(array));
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post("/deleteGameAndUpdateScore", function(req, res, next){
    var body = JSON.parse(req.body.action);

    var gameId = body.gameId;
    var winner = body.winner;
    var loser = body.loser;
    var pointsWon = body.pointsWon;
    var penaltyPoints = body.penaltyPoints;
    
    var session = driver.session();
    session
    .run( 'MATCH (g:Game {GameId: {gameId} }) <- [r:HASGAME] - (), (w:User {Username:{winner} }), (l:User {Username:{loser} }) set w.Points = w.Points + {pw}, l.Points = l.Points - {pp} delete r,g',{gameId:gameId, winner:winner, loser:loser,pw:pointsWon, pp:penaltyPoints  })
    .then (function (result){
      result.records.forEach(function (record){
     // - || - 
      });
      session.close();
      return res.send("ok");
    })
    .catch(function (error){
      console.log(error);
    });
});

router.post("/getScoreboard", function(req, res, next){
    var body = JSON.parse(req.body.action);

    var session = driver.session();
    var array = new Array();
    session
    .run( 'MATCH (u:User) return u ORDER BY u.Points DESC',{})
    .then (function (result){
      result.records.forEach(function (record){
        var user = record.get('u').properties;
        var ret = {Username:user.Username, Points:user.Points}
           array.push(ret); 
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

var gis = {
  /**
  * All coordinates expected EPSG:4326
  * @param {Array} start Expected [lon, lat]
  * @param {Array} end Expected [lon, lat]
  * @return {number} Distance - meter.
  */
  calculateDistance: function(start, end) {
    var lat1 = parseFloat(start[1]),
        lon1 = parseFloat(start[0]),
        lat2 = parseFloat(end[1]),
        lon2 = parseFloat(end[0]);

    return gis.sphericalCosinus(lat1, lon1, lat2, lon2);
  },

  /**
  * All coordinates expected EPSG:4326
  * @param {number} lat1 Start Latitude
  * @param {number} lon1 Start Longitude
  * @param {number} lat2 End Latitude
  * @param {number} lon2 End Longitude
  * @return {number} Distance - meters.
  */
  sphericalCosinus: function(lat1, lon1, lat2, lon2) {
    var radius = 6371e3; // meters
    var dLon = gis.toRad(lon2 - lon1),
        lat1 = gis.toRad(lat1),
        lat2 = gis.toRad(lat2),
        distance = Math.acos(Math.sin(lat1) * Math.sin(lat2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLon)) * radius;

    return distance;
  },

  /**
  * @param {Array} coord Expected [lon, lat] EPSG:4326
  * @param {number} bearing Bearing in degrees
  * @param {number} distance Distance in meters
  * @return {Array} Lon-lat coordinate.
  */
  createCoord: function(coord, bearing, distance) {
    /** http://www.movable-type.co.uk/scripts/latlong.html
    * φ is latitude, λ is longitude, 
    * θ is the bearing (clockwise from north), 
    * δ is the angular distance d/R; 
    * d being the distance travelled, R the earth’s radius*
    **/
    var 
      radius = 6371e3, // meters
      δ = Number(distance) / radius, // angular distance in radians
      θ = gis.toRad(Number(bearing));
      φ1 = gis.toRad(coord[1]),
      λ1 = gis.toRad(coord[0]);

    var φ2 = Math.asin(Math.sin(φ1)*Math.cos(δ) + 
      Math.cos(φ1)*Math.sin(δ)*Math.cos(θ));

    var λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ)*Math.cos(φ1),
      Math.cos(δ)-Math.sin(φ1)*Math.sin(φ2));
    // normalise to -180..+180°
    λ2 = (λ2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; 

    console.log(gis.toDeg(λ2));
    return [gis.toDeg(λ2), gis.toDeg(φ2)];
  },
  /**
   * All coordinates expected EPSG:4326
   * @param {Array} start Expected [lon, lat]
   * @param {Array} end Expected [lon, lat]
   * @return {number} Bearing in degrees.
   */
  getBearing: function(start, end){
    var
      startLat = gis.toRad(start[1]),
      startLong = gis.toRad(start[0]),
      endLat = gis.toRad(end[1]),
      endLong = gis.toRad(end[0]),
      dLong = endLong - startLong;

    var dPhi = Math.log(Math.tan(endLat/2.0 + Math.PI/4.0) / 
      Math.tan(startLat/2.0 + Math.PI/4.0));

    if (Math.abs(dLong) > Math.PI) {
      dLong = (dLong > 0.0) ? -(2.0 * Math.PI - dLong) : (2.0 * Math.PI + dLong);
    }

    return (gis.toDeg(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
  },
  toDeg: function(n) { return n * 180 / Math.PI; },
  toRad: function(n) { return n * Math.PI / 180; }
};



module.exports = router;
