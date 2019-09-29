const config = require('./config.json');
const bcrypt = require('bcrypt');
const mg = require('mongoose');
const models = require('./models.js');
const auth = require('./auth.js');

// prompt user for first password
const stdin = process.stdin;
// avoid showing password in terminal
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );
let pwd = '';
console.log('Type new administrator password then press Ctrl+c')
process.stdout.write('Password:');
stdin.on( 'data', ( c ) => {
    if (c === '\u0003') { // ctrl-c
        createUser(pwd);
    }
    else {
        pwd += c;
        process.stdout.write('*')
    }
});

function createUser(pwd) {
    const admin = {
        username: 'admin',
        password: bcrypt.hashSync(pwd, 10),
        permissions: 'admin'
    };
    mg.connect(config.dbConnStr, function (err) {
        if (err) console.log(err);
        else {
            console.log('Connected to MongoDB');
            models.User.update({}, {$set: admin}, {upsert: true})
                .then(() => {
                    console.log('Database seeded correctly. You can now start the application with `node server.js`')
                    process.exit();
                })
                .catch(err => {
                    console.error('Failed to seed database');
                    console.error(err);
                    process.exit();
                });
        }
    });

}

