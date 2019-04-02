var express = require('express');
var router = express.Router();
var m = require('../models');

router.get('/department/:name', function (req, res, next) {
    // m.IDepartment.find().then(console.log)
    m.Department.findOne({shortName: req.params.name})
        .then(dept => {
            res.json(dept)
        })
        .catch(err => {
            console.log(err)
            res.status(400);
            res.send(err);
        })
});


module.exports = router;
