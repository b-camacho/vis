$(document).ready(function () {
	$.post("/bubblesData", function (data) {
			//console.log("Post to /bubblesData results: " + data);
//            data.forEach((datum) => {
//                console.log(datum.year + ' : ' + datum.points)
//            })
			var removedCounter = 0;
			data.forEach(function (invalidEl, invalidIndex, arr) {
				if(!invalidEl.year) {console.log('Invalid record: ' + invalidIndex);
					data.splice(invalidIndex + removedCounter, 1)}
			});

			data = data.sort(function (a, b) {
				if(a.year && b.year) return (a.year > b.year) - (a.year < b.year);
			});
			console.log(data);

			var PageCountsGroupedByYear = [];
			PageCountsGroupedByYear[0] = {
				year: data[0].year,
				pages: 0,
				points: 0
			};

			data.forEach(function (el) {
				var last = PageCountsGroupedByYear.length - 1;
				if(PageCountsGroupedByYear[last].year == el.year) {
					PageCountsGroupedByYear[last].pages += el.pageAmount;
					PageCountsGroupedByYear[last].points += el.points;
				}
				else PageCountsGroupedByYear.push({
					year: el.year,
					pages: el.pageAmount,
					points: el.points
				})
			});
			console.log(PageCountsGroupedByYear);

			drawBubbleGraph(PageCountsGroupedByYear)
		}

	)});

function drawBubbleGraph(data) {

	var svg = d3.select('#svg-port');

	var width = parseInt(svg.style('width').replace('px', '')) - 96;
	var trueHeight = parseInt(svg.style('height').replace('px', ''));
	var height = 0.85 * trueHeight;


	var sumOfPages = 0;
	var sumOfPoints = 0;
	var years = data.map(function (el) {
		sumOfPages += Math.sqrt(el.pages);
		sumOfPoints += Math.sqrt(el.points);
		return el.year;
	});

	var rays = [];
	data.forEach(function (el) {
		rays.push((Math.sqrt(el.pages) / sumOfPages) * Math.min(width, height) * 0.8);
	});

	var points = [];
	data.forEach(function (el) {
		points.push(el.points)
	})

	var centres = [];
	rays.forEach(function (el, index) {
		centres.push(0);

		var i = 0;
		while (i<index) {
			centres[centres.length - 1] += rays[i]*2;
			i++
		}
		centres[centres.length - 1] += el;
	});

	console.log(years)
	console.log(rays)
	console.log(centres)
	console.log(points)

	var xScale = d3.scaleOrdinal()
		.domain(years)
		.range(centres);

	var bubbleTip = d3.tip().attr('class', 'd3-tip').html(function(d, i) {
		if(!data[i]) {
			console.log(data);
			console.log(d);
			console.log(i);
		}
		return 'Rok: ' + years[i] + '<br>' + 'Stron: ' + data[i].pages });
	svg.call(bubbleTip);

	var pointBubbleTip = d3.tip().attr('class', 'd3-tip').html(function(d, i) {
		if(!data[i]) {
			console.log(data);
			console.log(d);
			console.log(i);
		}
		return 'Rok: ' + years[i] + '<br>' + 'Punktacja ministerstwa: ' + data[i].points });
	svg.call(pointBubbleTip);


	///Drawing the axes
	var bottomYears=[], bottomCentres=[];
	var topYears=[], topCentres=[];
	var pointYears = [], pointCentres = [];

	years.forEach(function (el, index) {

		pointYears.push(years[index]);
		pointCentres.push(centres[index]);

		if(index%2 == 0) {
			bottomYears.push(el);
			bottomCentres.push(centres[index]);
		}
		else {
			topYears.push(el);
			topCentres.push(centres[index]);
		}
	});

	var xAxisTop = d3.axisTop(d3.scaleOrdinal().range(topCentres).domain(topYears)).tickFormat(function (d, i) {
		if(topCentres[i] - topCentres[i-1] < 12) return "";
		return d;
	});
	var xAxisBottom = d3.axisBottom(d3.scaleOrdinal().range(bottomCentres).domain(bottomYears)).tickFormat(function (d, i) {
		if(bottomCentres[i] - bottomCentres[i-1] < 10) return "";
		return d;
	});
	var xAxisPoints = d3.axisBottom(d3.scaleOrdinal().range(pointCentres).domain(pointYears)).tickFormat(function (d, i) {
		if(pointCentres[i] - pointCentres[i-1] < 10) return "";
		return d;
	});

	var axisGroupTop = svg.append('g').call(xAxisTop).attr('transform', 'translate(' + [20, 20 ] + ')');
	var axisGroupBottom = svg.append('g').call(xAxisBottom).attr('transform', 'translate(' + [20, height -20 ] + ')');
	var axisGroupPoints = svg.append('g').call(xAxisPoints).attr('transform', 'translate(' + [20, trueHeight - 20] + ')');


	///Drawing the guidelines
	var lines = svg.append('g')
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
			if(i%2==0) return height;
			else return 20 })
		.attr('stroke', 'black')
		.attr('stroke-dasharray', '5, 5')
		.attr('opacity', '0.5');

	///Drawing bubbles
	var bubbles = svg
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

	var pointHeightScale = d3.scaleLinear()
		.domain([Math.max(...points), Math.min(...points)])
.range([height + ( (trueHeight - height) / 2), trueHeight - 10])

	var pointBubbles = svg
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
			console.log(points[i+1]);
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

var colorCounter = 0;
function NextColor() {
	if (colorCounter >= 9) colorCounter = 0;
	return d3.schemeSet2[colorCounter++];
}



