const config = require('./config.json');
const bcrypt = require('bcrypt');
const mg = require('mongoose');
const models = require('./models.js');
const auth = require('./auth.js');

const stdin = process.stdin;
stdin.setRawMode( true ); // avoid showing password in terminal
stdin.resume();
stdin.setEncoding( 'utf8' );
let pwd = '';
console.log('Type new administrator password then press Enter');
process.stdout.write('Password:');
stdin.on( 'data', ( c ) => {
    if (['\u000A', '\u000D'].includes(c)) { // newline

        process.stdout.write('\n');
        createUser(pwd);
    }
    else if (['\u0003', '\u0004'].includes(c)) { //ctrl-c, ctrl-d
        process.stdout.write('\nCancelled, no changes were made.');
        process.exit()
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
    mg.connect(config.dbConnStr, {useMongoClient: true}, function (err) {
        if (err) handleErr(err)
        else {
            console.log('Connected to MongoDB');
            models.User.update({}, {$set: admin}, {upsert: true}, function (err) {
                if (err === null) {
                    console.log('Database seeded correctly. You can now start the application with `node server.js`')
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
