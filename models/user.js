var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

mongoose.connect('localhost/ideation');

var db = mongoose.connection;


// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	category:{
		type: []
	},
	type:{
		type: String
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

var User = module.exports = mongoose.model('User', UserSchema);

//Function to handle
module.exports.createUser = function(newUser, callback){
	//newUserpassword, salt, callbackfunction
	bcrypt.hash(newUser.password, 10, function (err, hash){
		if(err) throw err;
		//Set hashed password
		newUser.password = hash;
		// Create user
		newUser.save(callback);
	});
	
}

module.exports.getUserByUsername = function (username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	// This function findById is provided by mongoose
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function (err, isMatch){
		if(err) return callback(err);
		callback(null, isMatch);
	});
};


