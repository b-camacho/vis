var bcrypt = require('bcrypt');
var m = require('./models');

module.exports.authenticate = function (username, password, cb) {
	m.User.findOne({username: username}, function (err, user) {
		if(err) {
			return cb(err)
		}
		if(!user) {
			console.log('No such user');
			return cb({code: 401})
		}

		if(bcrypt.compareSync(password, user.password)) {
			cb(null, user)
		}
		else {
			console.log('Invalid password');
			cb({code: 401})
		}
	})
};

module.exports.hashPassword = function (password, cb) {
	var salt = bcrypt.genSaltSync;
	cb({
		password: bcrypt.genHashSync(password, salt),
		salt: salt
		})

}
