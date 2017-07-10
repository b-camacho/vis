function ParseExpertusCollaborationList(rawText) { //an array of arrays containing author names
    rawText = rawText.trim();
    var lines = rawText.split('\n');
    var works = [];
    for(var i=0; i<lines.length; i++) {
        var people = [];
        while(isPerson(lines[i]) != false && i < lines.length) {
            people.push(isPerson(lines[i]));
            i++
        }
        if(people.length > 0) works.push(people);
    }
    
    return(works);
}

function ParseExpertusWorksOverTime(rawText) {
    rawText = rawText.trim();
    var lines = rawText.split('\n');
    var works = [];
    for(var i=0; i<lines.length; i++) {
        if(isPublicationYear(lines[i]) != false) works.push(isPublicationYear(lines[i]));
    }
    return works;
}

function isPerson (string) {
    if(string.length < 3) return false;
    //console.log(parseInt(string.substring(0, 3)));
    if(string.substring(0, 3) == '700') {
        return string.substring(4);
    }
    else return false;
}

function isPublicationYear (string) {
    string = string.trim();
    if(string.length < 3) return false;
    //console.log(parseInt(string.substring(0, 3)));
    if(string.substring(0, 3) == '260') {
        return string.substring(string.length - 4);
    }
    else return false;
}