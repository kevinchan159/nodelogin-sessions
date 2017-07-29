var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String,
		unique: true
	},
	username: {
		type: String,
		unique: true
	},
	password: {
		type: String,
	}
});

var User = module.exports = mongoose.model('User', userSchema);