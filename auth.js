var bcrypt = require('bcrypt');
var m = require('./models');

module.exports.authenticate = function (username, password, cb) {
	m.User.findOne({username: username}, function (err, user) {
		if(err) {
			return cb(err)
		}
		if(!user) {
			return cb({code: 401})
		}

		if(bcrypt.compareSync(password, user.password)) {
			cb(null, user)
		}
		else {
			cb({code: 401})
		}
	})
};