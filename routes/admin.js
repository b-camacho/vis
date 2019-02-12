var express = require('express');
var PDFDocument = require('pdfkit');
var svgToPdf = require('svg-to-pdfkit');
var fs = require('fs');
var router = express.Router();
var mg = require('mongodb');
var m = require('../models');
var auth = require('../auth')
var parser = require('../expertus')


router.post('/auth', function (req, res, next) {
	auth.authenticate(req.body.username, req.body.password, function (err, user) {
		if(err) {
			return res.redirect('/error/auth');
		}
		req.session.isAdmin = user.permissions === 'admin';
		req.session.save(() =>
			res.redirect('/admin/')
		)

	})
})

router.get('/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/')
})

router.use('*', function (req, res, next) {
	if(!req.session.isAdmin) {
		return res.render('admin/login', res.data);
	}
	else {
		console.log('Auth correct')
		next();
	}
})

router.get('/', function (req, res, next) {

	m.Department.find().then(departments => {
		res.data.savedItems = departments.map(dept => {
			dept._id = dept._id.toString();
			return dept;
		});
		return res.render('admin/dashboard', res.data);
	})

})

//
// router.get('/listSaved', function (req, res, next) {
// 	m.Department.find({}, 'name shortName', function (err, depts) {
// 		res.data.depts = depts
// 	})
//
// 	res.render('listSaved')
// })

// router.get('/deleteSaved', function (req, res, next) {
// 	m.Department.deleteOne({name: req.name}, function (err) {
// 		res.redirect('admin/dashboard')
// 	})
// })

router.post('/addSaved', function (req, res, next) {
	parser.upload(req, function (err, file, name) {
		if(err) {
			console.log(err);
			return res.redirect('/error/parser');
		}
		parser.parse(file, function (err, works, queryName) {
			if(err) {
				console.log(err);
				return res.redirect('/error/parser');
			}
			var newDept = new m.Department({
				name: name,
				shortName : name.split(' ').map(function (name) {
					return name[0]
				}).join(''),
				works: works
			})

			newDept.save().catch(console.log);

			res.redirect('/');


		})
	})
	console.log('path done');
});

router.get('/removeSaved', function (req, res, next) {
	console.log('removing: ' + req.query.name);
	m.Department.remove({_id: req.query.name}).then();

	res.redirect('/admin');

})

/*
router.get('/enableSaveMode', function (req, res) {
	req.session.saveModeEnabled = true;
	res.redirect('/')
})
router.get('/disableSaveMode', function (req, res) {
	req.session.saveModeEnabled = false;
	res.redirect('/')
})*/
router.get('/setShortName', function (req, res) {
	var newName = req.query.new, fullName = req.query.name;
	if(newName && fullName) {
		m.findOne({name: fullName}, function (err, result) {
			if(err) console.log(err)

			m.shortName = newName;
			m.save();
		})
	}
})

module.exports = router;
