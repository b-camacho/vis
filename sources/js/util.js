export function DeclinatePolishWordPraca(word, number) {
	if(number == 1) return number + ' praca'
	if(number >=2 && number <=4) return number + ' prace'
	return number + ' prac'
}

export function multiple(wordObj, n) {
	if(n === 1) return wordObj["1"];
	if(n === 2) return wordObj["2"];
	return wordObj["many"];
}

export function PolarToCartesian(angle, radius) {
	return {
		x: Math.cos(angle) * radius,
		y: Math.sin(angle) * radius,
		angle: angle,
		r: radius
	}
}


export function CartesianLengthToPolar(length, radius){
  return length / radius
}

export function toRad(deg) {
	return deg*Math.PI/180;
}

export function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}
