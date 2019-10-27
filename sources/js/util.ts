import * as d3 from 'd3'
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

export class Point {
	constructor(public x?:number, public y?:number) {};


	Dist(other: Point): number {
		return Math.sqrt(Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2))
	}

	ToRad(center: Point): RadPoint {
		let r = this.Dist(center);
		let th =  Math.atan2(center.y - this.y, center.x - this.x);
		return new RadPoint(th, r)
	}
}

export class RadPoint {
	constructor(public th:number, public r:number) {};
	ToCart(): Point{
		return new Point(Math.cos(this.th) * this.r, Math.sin(this.th) * this.r)
	}
}

export function clearSvg() {
	d3.select('svg').selectAll('*').remove();
}

export function addButton(selector:string, text: string, onClick: Function) {
	const button = document.createElement('button');
	button.setAttribute('class','btn line-btn');
	const span = document.createElement('span');
	span.innerHTML = text;
	button.appendChild(span);
	document.querySelector(selector).append(button);
}

export function getDimensions(selector:string): Array<number> {
	const rect = document.querySelector('#svg-port').getBoundingClientRect();
	return [rect.width, rect.height]
}
