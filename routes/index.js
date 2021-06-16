var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");

var MongoClient = require('mongodb').MongoClient;
var urlToCreate = "mongodb://localhost:27017/<project>DB";
var url = "mongodb://localhost:27017/";

const TOKEN_SECRET =
  "F9EACB0E0AB8102E999DF5E3808B215C028448E868333041026C481960EFC126";

const generateAccessToken = (username) => {
  return jwt.sign({ username }, TOKEN_SECRET);
};

router.get("/createDB", (req, res) => {
  MongoClient.connect(urlToCreate, function (err, db) {
    console.log("err", err)
    if (err) {
      console.error(err)
    } else {
      console.log("Database created!");
      db.close();
    }
    res.send();
  });
})

router.get("/createUserColection", () => {
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("projectDB");
    dbo.createCollection("users", function (err, res) {
      if (err) throw err;
      console.log("Collection created!");
      db.close();
    });
  });
})

router.get("/login", function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
  const { user, password } = req.query;
  //Check the pwd in the server
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("projectDB");
    var query = { user };
    dbo.collection("users").find(query).toArray(function (err, result) {
      if (err) throw err;
      if (!result || result.length === 0) {
        return res.status(401).send();
      }
      db.close();
      if (result[0].password = password) {
        const token = generateAccessToken(user);
        console.log("token", token);
        return res.json({ token }).send();
      } else {
        return res.status(401).send();
      }
    });
  });

});

router.post("/signup", function (req, res) {
  const { user, password } = req.body; //Adress, phone ....
  //Validations.
  //Check if user exists
  MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var dbo = db.db("projectDB");
    var myobj = { username: user, password };
    dbo.collection("users").insertOne(myobj, function (err, res) {
      if (err) throw err;
      console.log("1 document inserted");
      db.close();
    });
    const token = generateAccessToken(user);
    console.log("token", token);
    return res.json({ token }).send();
  });
});
module.exports = router;
