var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var Papa = require('babyparse');
var fs = require('fs');
var https = require('https');
var path = require('path');
var admin = require('firebase-admin');
var app = express();
var mongoose = require('mongoose');



app.use(bodyParser.json())
app.use("/public", express.static(path.join(__dirname, '/../public')));
app.use("/", express.static(path.join(__dirname, '/../frontend/build')));
app.use("/static", express.static(path.join(__dirname, '/../frontend/build/static')));


app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, db, collection, id");
	next();
});

var secret = "./private/secret.json";
var fbUrl = "https://deloittedistinction-d9cda.firebaseio.com/";

admin.initializeApp({
	credential: admin.credential.cert(secret),
	databaseURL: fbUrl,
});
var db = admin.database();

// var db = admin.database();
// var ref = db.ref("restricted_access/secret_document");
// ref.once("value", function(snapshot) {
//   console.log(snapshot.val());
// });

// var Server = mongo.Server,
// 		Db = mongo.Db,
// 		BSON = mongo.BSONPure,
// 		ObjectID = mongo.ObjectID;;

// *************** CONFIG *******************

// HEADERS: db, collectioin, id

// var server = new Server('http://52.55.4.4', 27017, {auto_reconnect: true});
// var server = new Server('http://localhost', 27017, {auto_reconnect: true});
// var mongooseServer = 'mongodb://localhost/distinction';
//
// mongoose.connect(mongooseServer);
// var emptySchema = new mongoose.Schema({_id: String, data: Object}, { strict: false });
// var mongooseModel = collection => mongoose.model(collection, emptySchema, collection);


var emptyObject =[{}];
var portListen = 443;
var dbName = 'dd17'

app.get('/queensdata', queens);
app.get('/iveydata', ivey);
app.get('/distinctiondata',distinction)
// app.get('/feedback', findAll);
// app.post('/feedback' , adddata);
// app.delete('/'+rootApi+'/:id', deletedata);

// *************** CONFIG *******************

// var options = {
//    key: fs.readFileSync('./privkey.pem', 'utf8'),
//    cert: fs.readFileSync('./fullchain.pem', 'utf8')
// };
// https.createServer(options, app).listen(443);

app.listen(portListen);
// db = new Db(dbName, server);
// db.open();

console.log('Listening on port '+ portListen +'...');

// function findAll (req, res) {
// 		collectionName = req.header('collection');
// 		console.log('connected to collection: ', collectionName);

// 		if (collectionName) {
// 				// db.collection(collectionName, function(err, collection) {
// 				// 		collection.find().toArray(function(err, items) {
// 				// 				res.send(items);
// 				// 		});
// 				// });
// 				const ref = db.ref(collectionName);
// 				ref.once('value',
// 					result => res.status(200).jsonp(result.val()),
// 					error => res.status(300).jsonp({status: 'fail', error: 'firebase read failed'})
// 				);
// 		} else {
// 				res.status(300).jsonp({status: 'fail', error: 'wrong db or collection in header'});
// 		}
// };

// function adddata (req, res) {
// 		collectionName = req.header('collection');
// 		console.log('connected to collection: ', collectionName);

// 		if (collectionName) {
// 				var data = req.body;
// 				console.log('Adding data: ' + JSON.stringify(data));

// 				// const Model = mongooseModel(collectionName);
// 				// Model(data).save((err, result) => {
// 				// 	if(err) {
// 				// 		res.send({'error':'An error has occurred', err});
// 				// 	} else {
// 				// 		 res.status(200).jsonp({status: 'success'});
// 				// 	}
// 				// });

// 				// db.collection(collectionName, function(err, collection) {
// 				// 		collection.insert(data, {safe:true}, function(err, result) {
// 				// 				if (err) {
// 				// 						res.send({'error':'An error has occurred', err});
// 				// 				} else {
// 				// 						console.log('Success: ' + JSON.stringify(result));
// 				// 						res.send(result);
// 				// 				}
// 				// 		});
// 				// });

// 				var ref = db.ref(collectionName);

// 				ref.update(data,
// 					(err) => {
// 						if(err) {
// 							return res.status(300).jsonp({status: 'fail', error: 'firebase write failed'});
// 						} else {
// 							return res.status(200).jsonp({status: 'success'});
// 						}
// 				});
// 		} else {
// 				return res.status(300).jsonp({status: 'fail', error: 'wrong db or collection in header'});
// 		}
// }

function deletedata (req, res) {
		collectionName = req.header('collection');
		password = req.header('password')
		correctPass = 'dd2017'
		console.log('connected to collection: ', collectionName);

		if (collectionName && password === correctPass) {
				var id = req.params.id;
				console.log('Deleting data: ' + id);
				db.collection(collectionName, function(err, collection) {
						collection.remove({'_id':new ObjectID(id)}, {safe:true}, function(err, result) {
								if (err) {
										res.send({'error':'An error has occurred - ' + err});
								} else {
										console.log('' + result + ' document(s) deleted');
										res.send(result);
								}
						});
				});
		} else {
				res.status(300).jsonp({status: 'fail', error: 'wrong db or collection in header'});
		}
}

function queens (req, res) {
		console.log('getting all queens names:');
		var picPath = '/pics-queens/';
		payload = readFile('../public/queens.csv', picPath)
		res.send(payload);
};

function ivey (req, res) {
		console.log('getting all ivey names:');
		var picPath = '/pics-ivey/';
		payload = readFile('../public/ivey.csv', picPath)
		res.send(payload);
};

function distinction (req, res) {
		console.log('getting all distinction names:');
		var picPath = '/pics-distinction/';
		payload = readFile('../public/distinction.csv', picPath)
		res.send(payload);
};

function readFile (file, picPath) {

	var content = fs.readFileSync(file, { encoding: 'binary' });
	var payload = []
	Papa.parse(content, {
		header: true,
		step: function(row){
				picLink = row.data[0].pic === '' ? null : picPath+row.data[0].pic;
				payload.push({id: row.data[0].id, name: row.data[0].name, pic: picLink})
		},
		error: function(error) {
			return {error: true};
		}
	});
	return payload;
}
