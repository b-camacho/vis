function PolskaFleksjaSlowaPraca(word, number) {
	if(number == 1) return number + ' praca'
	if(number >=2 && number <=4) return number + ' prace'
	return number + ' prac'
}

if (!Array.prototype.includes) {
   Array.prototype.includes = function(searchElement /*, fromIndex*/) {
       'use strict';
       if (this == null) {
           throw new TypeError('Array.prototype.includes called on null or undefined');
       }

       var O = Object(this);
       var len = parseInt(O.length, 10) || 0;
       if (len === 0) {
           return false;
       }
       var n = parseInt(arguments[1], 10) || 0;
       var k;
       if (n >= 0) {
           k = n;
       } else {
           k = len + n;
           if (k < 0) {k = 0;}
       }
       var currentElement;
       while (k < len) {
           currentElement = O[k];
           if (searchElement === currentElement ||
                   (searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
               return true;
           }
           k++;
       }
       return false;
   };
}

function PolarToCartesian(angle, radius) {
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
		angle: angle,
		r: radius
	}
}


function CartesianLengthToPolar(length, radius){
  return length / radius
}

function toRad(deg) {
	return deg*Math.PI/180;
}

function compJournalTitles(titles) {
	titles = titles.map(function (title) {
		title.toLowerCase()
		[' ', '.', ',', '\'', '', ':', ';'].forEach(function (ignoredChar) {
			title.split(ignoredChar).join('')
		})
	});

	return titles.reduce(function (title, acc) {
		return acc && (title === acc)
	}, titles[0]);



}