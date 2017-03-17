var MarcLookup = {
    "245": "title",
    "246": "title-variant",
    "773": "journal",
    "740": "conference",
    "260": "year",
    "300": "pageRange"
};

var Methods = {};

Methods.ParseWork = function (Text) {
    Text = Text.trim();
    var linesArray = Text.split('\n');
    var workObject = {};
    workObject.authors = [];
    workObject.authorsExpertusFormat = [];
    workObject.languages = [];
    workObject.invalid = {};
    linesArray.forEach(function (line) {

        switch (line.substr(0, 3)) {
            case "245":
                workObject.title = line.substr(4).trim();
                break;

            case "246":
                workObject.titleVariant = line.substr(4).trim();
                break;

            case "260":
                workObject.year = Number.parseInt(line.substr(line.length - 5).trim());
                let citySeparatorIndex = line.indexOf(':');
                workObject.potentialCity = (citySeparatorIndex != -1) ? line.substr(4, citySeparatorIndex - 4).trim() : null;
                break;

            case "300":
                line = line.substr(4);
                var pageRange = line.match(/[0-9]{1,5}-[0-9]{1,5}/);
                if(pageRange != null) {
                    var pageArray = pageRange[0].split('-');
                    workObject.pageRange = pageRange[0];
                    workObject.pageAmount = Number.parseInt(pageArray[1]) - Number.parseInt(pageArray[0]) + 1;
                }
                else if(line.match(/[0-9]{1,5}/) != null) {
                    workObject.pageRange = '0-' + line.match(/[0-9]{1,5}/)[0].trim();
                    workObject.pageAmount = Number.parseInt(line.match(/[0-9]{1,5}/)[0].trim());
                }
                else  {
                    workObject.invalid["300"] = 'Could not infer page range from description';
                    workObject.unparsedPageAmount = line.substr(4);
                    console.log(new Error('Failed RegExp parse at pageRange of line: ' + line).message)
                    
                }
                break;

            case "773":
                workObject.publicationType = 'article';
                workObject.publishedIn = line.substr(4).trim();
                break;

            case "740":
                workObject.publicationType = 'book';
                workObject.publishedIn = line.substr(4).trim();
                break;

            case "700":
                var name = line.substr(4).trim();
                workObject.authorsExpertusFormat.push(name);
                if(name.split(',')[1] == undefined) {
                    workObject.invalid["700"] = 'Could not separate name and surname';
                    break;
                }
                workObject.authors.push(name.split(',')[1].trim() + ' ' + name.split(',')[0].trim());
                break;
            case "025":
                workObject.languages.push(line.substr(4).trim());
                break;
        }
    });


    return workObject;
};

module.exports = Methods;