/**
 * Created by nopony on 26/08/2016.
 */

//prior to using this, please remove all diacritic characters with 'remove-diacricits.js'
function compareNames(name1, name2) { //supported formats: N. Surname, Name Surname, Surname Name and some variations
    name1 = removeStopCharacters(name1);
    name2 = removeStopCharacters(name2);
    
    function makeVariations (arr) {
        return [
            [arr[0], arr[1]],
            [arr[0][0], arr[1]],
            [arr[1][0], arr[0]]
        ]
    }

    var arr1 = name1.split(' ');
    var arr2 = name2.split(' ');

    var variations1 = makeVariations(arr1);
    var variations2 = makeVariations(arr2);
    
    for(var i=0; i<variations1.length; i++) {
        if(variations1[i][0] == arr2[0] && variations1[i][1] == arr2[1]) return true;
        if(variations1[i][1] == arr2[0] && variations1[i][0] == arr2[1]) return true;
        if(variations2[i][0] == arr1[0] && variations2[i][1] == arr1[1]) return true;
        if(variations2[i][1] == arr1[0] && variations2[i][0] == arr1[1]) return true;
    }
    
    console.log(variations1);
    console.log(variations2);
    
    return false;
}

function removeStopCharacters (string) {
    return string.replace('.', '').replace(',', '').replace(';', '').trim();
}