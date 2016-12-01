var mg = require('mongoose');
var m = require('./models');
mg.connect('mongodb://localhost/vis', function (err) {
    if(!err)console.log('DB connected');
    m.Work.find({}, function (err, works) {
        //console.log(works);
        if(works) console.log('There are ' + works.length + ' works in the DB');
        works.forEach(function (work, index) {
            setTimeout(function(){
                work.authors.forEach(function (author) {
                    m.Person.findOne({name: author}, function (err, person) {
                        if(err) return console.log(err.message);
                        if(person == null || person == undefined) {
                            var newPerson = new m.Person({
                                name: author,
                                works: [work._id.toString()],
                                journals: {}
                            });
                            if(work.publicationType == 'article') newPerson.journals[work.publishedIn.split('.').join('<notadot>')] = 1;
                            newPerson.save(function (err) {
                                if(err) return console.log('Could not save person, name:' + author + ' because of ' + err.message);
                                console.log('New person saved, name: ' + author);
                            });
                        }
                        else {
                            if(person.works.indexOf(work._id.toString()) == -1) {
                                person.works.push(work._id.toString());
                                if(work.publicationType == 'article')
                                    if(person.journals[work.publishedIn.split('.').join('<notadot>')]) person.journals[work.publishedIn.split('.').join('<notadot>')]++;
                                    else person.journals[work.publishedIn.split('.').join('<notadot>')] = 1;
                                person.markModified('works');
                                person.markModified('journals');
                                person.save();
                            }
                        }
                    })
                })
            }, index*10)
        })
    });
});
