const config = require('./config.json');
const bcrypt = require('bcrypt');
const mg = require('mongoose');
const models = require('./models.js');
const auth = require('./auth.js');
const readline = require("readline");

readUsername((username) => {
    readPassword((password) => {
        createUser(username, password);
    })
});

function readUsername(cb) {
    readString('Username:', false, cb);
}

function readPassword(cb) {
    readString('Password:', true, cb);
}

function readString(prompt, hidden, cb) {
    const stdin = process.stdin;
    stdin.setRawMode( true ); // avoid showing password in terminal
    stdin.resume();
    stdin.setEncoding( 'utf8' );
    let out = '';
    process.stdout.write(prompt);
    const readChar = ( c ) => {
        if (['\u000A', '\u000D'].includes(c)) { // newline
            process.stdout.write('\n');
            stdin.removeListener('data', readChar);
            cb(out);
        }
        else if (['\u0003', '\u0004'].includes(c)) {
            process.stdout.write('\nCancelled, no changes were made.');
            process.exit()
        }
        else {
            out += c;
            process.stdout.write(hidden ? '*' : c)
        }
    }
    stdin.on( 'data', readChar);
}

function createUser(username, password) {
    const admin = {
        username,
        password: bcrypt.hashSync(password, 10),
        permissions: 'admin'
    };
    mg.connect(config.dbConnStr, {useMongoClient: true}, function (err) {
        if (err) handleErr(err)
        else {
            console.log('Connected to MongoDB');
            models.User.update({username}, {$set: admin}, {upsert: true}, function (err) {
                if (err === null) {
                    console.log('Created user ' + username)
                    process.exit();
                }
                else {
                    handleErr(err)
                }
            })
        }
    });

}

function handleErr(err) {
    console.error('Database seed failed, reason:');
    console.error(err);
    console.error('No changes were made.');
    process.exit();
}
