var fs = require('fs');




var mg = require('mongoose');
mg.connect('mongodb://localhost/vis', function (err) {
    Read();
});

function Read() {
    
}