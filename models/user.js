var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;


// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String, 
		required: true,
		bcrypt: true
	},
	email:{
		type: String
	},
	name: {
		type: String
	},
	profileimage: {
		type: String
	}
});
