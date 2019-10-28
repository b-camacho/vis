import * as $ from 'jquery'
import * as d3 from 'd3'
$(document).ready(function () {
	const svg = d3.select('#svg-port');

	const width = parseInt(svg.style('width').replace('px', ''));
	const height = parseInt(svg.style('height').replace('px', ''));

	$.post("wordcloudData", {width: width, height: height}, function (data) {
			console.log(data);
			displayWordcloud(data);
		}
	)
});

function displayWordcloud(textObjects) {
	console.log(textObjects)
	const svg = d3.select('#svg-port');

	const width = parseInt(svg.style('width').replace('px', ''));
	const height = parseInt(svg.style('height').replace('px', ''));

	const colorScale = d3.scaleOrdinal(d3.schemeSet3)
		.domain([0, 10]);

	svg
		.append('g')
		.attr('id', 'polish')
		.attr('transform','translate( ' + [width/4, height/2] + ')')
		.selectAll('text')
		.data(textObjects.polish)
		.enter()
		.append('text')
		.text(function (d) {return d.text})
.attr('text-anchor', 'middle')
		.attr('transform', function (d) {return 'translate(' + [d.x, d.y] + ')' +
		'rotate(' + d.rotate + ')'})
.attr('fill', (d, i) => {return colorScale(i%10)})
.attr('font-family', 'sans-serif')
		.attr('text-anchor', 'middle')
		.attr('font-size', (d) => {return d.size });
	svg
		.append('g')
		.attr('id', 'english')
		.attr('transform','translate( ' + [width/1.3, height/2] + ')')
		.selectAll('text')
		.data(textObjects.english)
		.enter()
		.append('text')
		.text((d) => {return d.text})
.attr('text-anchor', 'middle')
		.attr('transform', (d) => {return 'translate(' + [d.x, d.y] + ')' +
		'rotate(' + d.rotate + ')'})
.attr('fill', (d, i) => {return colorScale(i%10)})
.attr('font-family', 'sans-serif')
		.attr('text-anchor', 'middle')
		.attr('font-size', (d) => {return d.size });
}
