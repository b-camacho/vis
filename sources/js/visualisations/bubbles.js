import * as d3 from 'd3';
import d3Tip from 'd3-tip';
import {Work, InjectContext} from "../common";

document.addEventListener('DOMContentLoaded', () => InjectContext( (works, strings) => {
	let removedCounter  = 0;
	works.forEach(function (invalidEl, invalidIndex) {
		if(!invalidEl.year || invalidEl.pageAmount < 0) {
			works.splice(invalidIndex + removedCounter, 1)}
	});

	works = works.sort( (a, b) => {
		if(a.year && b.year) return (a.year > b.year) - (a.year < b.year);
	});

	const PageCountsGroupedByYear = [];
	PageCountsGroupedByYear.push({
		year: works[0].year,
		pages: 0,
		points: 0
	});

	works.forEach(function (el) {
		if(el.pageAmount < 0) el.pageAmount = 0;
		const last = PageCountsGroupedByYear.length - 1;
		if(PageCountsGroupedByYear[last].year === el.year) {
			PageCountsGroupedByYear[last].pages += el.pageAmount;
			PageCountsGroupedByYear[last].points += el.points;
		}
		else PageCountsGroupedByYear.push({
			year: el.year,
			pages: el.pageAmount,
			points: el.points
		})
	});

	gData = works;

	const $buttonHost = document.querySelector('#genPdfBtn').parentElement;
	const button = document.createElement('button');
	button.setAttribute('class','btn line-btn');
	button.setAttribute('id','btn-show-overlay');
	button.onclick = () => showOverlay(works, strings);
	const text = document.createElement('text');
	text.innerHTML = strings.ministerial_points;
	button.appendChild(text);
	$buttonHost.appendChild(button);
	drawBubbleGraph(PageCountsGroupedByYear, strings)
}));

let gData;

function closeOverlay(){
	$('.blur').remove()
}
function showOverlay(works, strings) {
	let overlay = $('' +
		'<div class="blur">' +
		'   <div class="overlay"> ' +
		'       <div class="title-bar">' +
		'           <p class="title">' + strings.ministerial_points + '</p>' +
		'           <a href="#" id="close-overlay"><i class="close-btn fa fa-times" aria-hidden="true"></i></a>' +
		'	        <input id="ministerial-slider" type="range" min="0" max="50" step="1" />' +
		'           <p id="ministerial-display">25</p>' +
		'           <p id="ministerial-label">' + strings.point_threshold + '</p>' +
		'       </div>' +
		'       <svg id="overlay-svg-port"></svg>' +
		'   </div>' +
		'</div>');
	overlay.appendTo(document.body)
	document.querySelector('#close-overlay').onclick = closeOverlay;

	let slider = $('#ministerial-slider');
	let display = $('#ministerial-display');
	let port = $('#overlay-svg-port')

	DrawPoints(works, slider.val(), port.width(), port.height(), strings)

	slider.on('input', function () {
		display.text(slider.val())
		clearDisplay()
		DrawPoints(works, slider.val(), port.width(), port.height())
	})

}
function toDate(year){
	return new Date(year, 0, 1)
}
function DrawPoints(works, threshold, portWidth, portHeight, strings) {
	works = works.filter(function (w) {
		return w.ministerialArticle
	})
	var yearRange = getYearRange(works);
	const filteredWorks = filterByMinisterial(works, Number.parseInt(threshold));
	const yearNodes = groupByYear(yearRange, filteredWorks);
	const scoreRange = getScoreRange(yearNodes);

	const svg = d3.select('#overlay-svg-port');

	const axisPadding = 25, barPadding = 10;

	const xScale = d3.scaleLinear()
		.domain(yearRange.map(toDate))
		.range([axisPadding + barPadding, portWidth - axisPadding]);

	xScale(1990)
	const yScale = d3.scaleLinear()
		.domain(scoreRange)
		.range([axisPadding,portHeight - axisPadding].reverse());

	yScale(20);

	const overlayLines = svg.append('g').selectAll('line').data(yearNodes);
	const overlayBars = svg.append('g').selectAll('rect').data(yearNodes);

	const rectWidth = portWidth / (yearRange[1] - yearRange[0]) - barPadding;

	overlayBars.enter()
		.append('rect')
		// .attr('transform', 'translate(' + [20, -10] + ')')
		.attr('x', function (d) {
			return xScale(toDate(d.year)) - rectWidth/2;
		})
		.attr('y', function (d) {
			return yScale(d.points);
		})
		.attr('width', rectWidth)
		.attr('height', function (d) {
			return portHeight - yScale(d.points) - axisPadding

		})
		.attr('fill', function () {
			return '#2627d7'
		})
		// .attr('r', '0')
		// .transition()
		// .duration(500)
		.attr('r', function (d, i) {
			return 6;
		})
		.on('mouseover', function (d, i) {
			overlayTip.show(d, i);
		})
		.on('mouseout', function (d, i) {
			overlayTip.hide(d, i);
		});

	const xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat('%Y'));
	const yAxis = d3.axisLeft().scale(yScale);

	svg.append('g').call(xAxis)
		.attr('transform', 'translate(' + [0, portHeight - axisPadding] + ')')
	svg.append('g').call(yAxis)
		.attr('transform', 'translate(' + [axisPadding, 0] + ')')

	const overlayTip = d3Tip().attr('class', 'd3-tip').html(function(d, i) {
		return strings.vis.year["1"] + ": " + yearNodes[i].year + '<br>' + yearNodes[i].titles.join("<br>") });
	svg.call(overlayTip);


}

function clearDisplay() {
	d3.select('#overlay-svg-port').selectAll('*').remove();
}

function getYearRange(works) {
	if(works.length === 0) return [0, 0];
	let min = works[0].year, max = works[0].year;

	works.forEach(function (work) {
		if(work.year < min) min = work.year;
		if(work.year > max) max = work.year;
	});

	return [min, max]
}
function filterByMinisterial(works, threshold) {
	return works.filter(function (work) {
		return work.points >= threshold
	})
}
function groupByYear(yearRange, works) {
	const years = [];
	let wIdx = 0;
	for (let year = yearRange[0]; year < yearRange[1]; year++) {
		let groupedPoints = 0,
			groupedTitles = [];
		while(works[wIdx] && works[wIdx].year === year) {
			groupedPoints += works[wIdx].points;
			groupedTitles.push(works[wIdx].title);
			wIdx++;

		}

		years.push({
			year: year,
			points: groupedPoints,
			titles: groupedTitles
		})
	}

	return years
}

function getScoreRange(works) {
	if(works.length === 0) return [0, 0];
	var min = 0, max = 10;

	works.forEach(function (work) {
		if(work.points < min) min = work.points;
		if(work.points > max) max = work.points;
	});

	return [min, max]
}
function drawBubbleGraph(data, strings) {

	const svg = d3.select('#svg-port');

	const width = parseInt(svg.style('width').replace('px', '')) - 96;
	const trueHeight = parseInt(svg.style('height').replace('px', ''));
	const height = 0.85 * trueHeight;


	let sumOfPages = 0;
	let sumOfPoints = 0;
	const years = data.map(function (el) {
		sumOfPages += Math.sqrt(el.pages);
		sumOfPoints += Math.sqrt(el.points);
		return el.year;
	});

	const rays = [];
	data.forEach(function (el) {
		rays.push((Math.sqrt(el.pages) / sumOfPages) * Math.min(width, height) * 0.8);
	});

	const points = [];
	data.forEach(function (el) {
		points.push(el.points)
	})

	const centres = [];
	rays.forEach(function (el, index) {
		centres.push(0);

		var i = 0;
		while (i<index) {
			centres[centres.length - 1] += rays[i]*2;
			i++
		}
		centres[centres.length - 1] += el;
	});


	const xScale = d3.scaleOrdinal()
		.domain(years)
		.range(centres);

	const bubbleTip = d3Tip().attr('class', 'd3-tip').html(function(d, i) {
		return strings.vis.year["1"] + ": " + years[i] + '<br>' + strings.vis.page["many"] + ": " + data[i].pages });
	svg.call(bubbleTip);

	const pointBubbleTip = d3Tip().attr('class', 'd3-tip').html(function(d, i) {
		return strings.vis.year["1"] + ": " + years[i] + '<br>' + strings.vis.ministerial_score + ": " + data[i].points });
	svg.call(pointBubbleTip);

	const bottomYears=[], bottomCentres=[];
	const topYears=[], topCentres=[];
	const pointYears = [], pointCentres = [];

	years.forEach(function (el, index) {

		pointYears.push(years[index]);
		pointCentres.push(centres[index]);

		if(index%2 === 0) {
			bottomYears.push(el);
			bottomCentres.push(centres[index]);
		}
		else {
			topYears.push(el);
			topCentres.push(centres[index]);
		}
	});

	const xAxisTop = d3.axisTop(d3.scaleOrdinal().range(topCentres).domain(topYears)).tickFormat(function (d, i) {
		if(topCentres[i] - topCentres[i-1] < 12) return "";
		return d;
	});
	const xAxisBottom = d3.axisBottom(d3.scaleOrdinal().range(bottomCentres).domain(bottomYears)).tickFormat(function (d, i) {
		if(bottomCentres[i] - bottomCentres[i-1] < 10) return "";
		return d;
	});
	const xAxisPoints = d3.axisBottom(d3.scaleOrdinal().range(pointCentres).domain(pointYears)).tickFormat(function (d, i) {
		if(pointCentres[i] - pointCentres[i-1] < 10) return "";
		return d;
	});

	svg.append('g').call(xAxisTop).attr('transform', 'translate(' + [20, 20 ] + ')');
	svg.append('g').call(xAxisBottom).attr('transform', 'translate(' + [20, height -20 ] + ')');
	svg.append('g').call(xAxisPoints).attr('transform', 'translate(' + [20, trueHeight - 20] + ')');


	///Drawing the guidelines
	const lines = svg.append('g')
		.selectAll('line')
		.data(centres)
		.enter()
		.append('line')
		.attr('transform', 'translate(' + [20, -10] + ')')
		.attr('id', function (d, i) {
			return 'a' + data[i].year;
		})
		.attr('x1', function (d, i) {
			return centres[i] })
		.attr('y1', function () {
			return height/2; })
		.attr('x2', function (d, i) {
			return centres[i]})
		.attr('y2', function (d, i) {
			if(i % 2 === 0) return height;
			else return 20 })
		.attr('stroke', 'black')
		.attr('stroke-dasharray', '5, 5')
		.attr('opacity', '0.5');

	///Drawing bubbles
	const bubbles = svg
		.selectAll('rect')
		.data(data);
	bubbles.enter()
		.append('circle')
		.attr('transform', 'translate(' + [20, -10] + ')')
		.attr('cx', function (d) {
			return xScale(d.year);
		})
		.attr('cy', function () {
			return height / 2;
		})
		.attr('fill', function () {
			return NextColor()
		})
		.attr('r', '0')
		.on('mouseover', function (d, i) {
			bubbleTip.show(d, i);
			d3.select("#a" + d.year).transition().duration(200).attr('stroke-width', 3).attr('opacity', 0.7)
		})
		.on('mouseout', function (d, i) {
			bubbleTip.hide(d, i);
			d3.select("#a" + d.year).transition().duration(200).attr('stroke-width', 1).attr('opacity', 0.5)
		})
		.transition()
		.duration(500)
		.attr('r', function (d, i) {
			return rays[i];
		})

	///Drawing the point bubbles

	const pointHeightScale = d3.scaleLinear()
		.domain([Math.max(...points), Math.min(...points)])
		.range([height + ( (trueHeight - height) / 2), trueHeight - 10]);

	const pointBubbles = svg
		.selectAll('rect')
		.data(data);

	pointBubbles.enter()
		.append('line')
		.attr('transform', 'translate(' + [20, -10] + ')')
		.attr('x1', function (d) {
			return xScale(d.year)
		})
		.attr('y1', function (d) {
			return pointHeightScale(d.points)
		})
		.attr('x2', function (d, i) {
			if(i < data.length - 1)
				return xScale(data[i+1].year)
			else return xScale(data[i].year);
		})

		.attr('y2', function (d, i) {
			if(i < data.length - 1) return pointHeightScale(points[i+1])
			else return pointHeightScale(points[i]);
		})
		.attr('stroke-width', '1px')
		.attr('stroke', '#525690')

	pointBubbles.enter()
		.append('circle')
		.attr('transform', 'translate(' + [20, -10] + ')')
		.attr('cx', function (d) {
			return xScale(d.year);
		})
		.attr('cy', function (d) {
			return pointHeightScale(d.points);
		})
		.attr('fill', function () {
			return '#2627d7'
		})
		.attr('r', '0')
		.on('mouseover', function (d, i) {
			pointBubbleTip.show(d, i);
		})
		.on('mouseout', function (d, i) {
			pointBubbleTip.hide(d, i);
		})
		.transition()
		.duration(500)
		.attr('r', function (d, i) {
			return 4;
		});


}

let colorCounter = 0;
function NextColor() {
	if (colorCounter >= 9) colorCounter = 0;
	return d3.schemeSet2[colorCounter++];
}



