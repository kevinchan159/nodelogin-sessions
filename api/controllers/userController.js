var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
User = require('../models/user');


module.exports.createUser = function(user, callback) {
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(user.password, salt, function(err, hash) {
	        // Store hash in your password DB. 
	        user.password = hash;
	        user.save();
	        callback();
	    });
	});
}

module.exports.findUserByUsername = function(username, callback) {
	User.findOne({ username: username}, callback);
};

// hash is the user's actual password
module.exports.checkPassword = function(inputPassword, hash, callback) {
	bcrypt.compare(inputPassword, hash, function(err, isMatch) {
    	if (err) {
    		throw err;
    	}
    	callback(null, isMatch);

	});
};