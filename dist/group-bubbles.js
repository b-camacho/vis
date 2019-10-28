/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./sources/js/group-visualisations/bubbles.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./sources/js/group-visualisations/bubbles.js":
/*!****************************************************!*\
  !*** ./sources/js/group-visualisations/bubbles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

var gData;
$(document).ready(function () {
	$.post("/bubblesData", function (data) {

			var removedCounter  = 0;
			data.forEach(function (invalidEl, invalidIndex, arr) {
				if(!invalidEl.year || invalidEl.pageAmount < 0) {//console.log('Invalid record: ' + invalidIndex);
					data.splice(invalidIndex + removedCounter, 1)}
			});

			data = data.sort(function (a, b) {
				if(a.year && b.year) return (a.year > b.year) - (a.year < b.year);
			});
			//console.log(data);

			var PageCountsGroupedByYear = [];
			PageCountsGroupedByYear[0] = {
				year: data[0].year,
				pages: 0,
				points: 0
			};

			data.forEach(function (el) {
				if(el.pageAmount < 0) el.pageAmount = 0;
				var last = PageCountsGroupedByYear.length - 1;
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
			gData = data;
			$buttonHost = $('#genPdfBtn').parent();
			$buttonHost.append("<button class='btn line-btn' onclick='showOverlayWrapper()'>" + jsStrings.ministerial_points + "</button>")
			drawBubbleGraph(PageCountsGroupedByYear)
		}

	)});
function showOverlayWrapper() {
	showOverlay(gData)
}
function closeOverlay(){
	console.log('closing')
	$('.blur').remove()
}
function showOverlay(works) {
	var overlay = $('' +
		'<div class="blur">' +
		'   <div class="overlay"> ' +
		'       <div class="title-bar">' +
		'           <p class="title">' + jsStrings.ministerial_points + '</p>' +
		'           <a href="#" onclick="closeOverlay()"><i class="close-btn fa fa-times" aria-hidden="true"></i></a>' +
		'	        <input id="ministerial-slider" type="range" min="0" max="50" step="1" />' +
		'           <p id="ministerial-display">25</p>' +
		'           <p id="ministerial-label">' + jsStrings.point_threshold + '</p>' +
		'       </div>' +
		'       <svg id="overlay-svg-port"></svg>' +
		'   </div>' +
		'</div>');
	overlay.appendTo(document.body)

	var slider = $('#ministerial-slider');
	var display = $('#ministerial-display');
	var port = $('#overlay-svg-port')

	DrawPoints(works, slider.val(), port.width(), port.height())

	slider.on('input', function () {
		display.text(slider.val())
		clearDisplay()
		DrawPoints(works, slider.val(), port.width(), port.height())
	})

}
function toDate(year){
	return new Date(year, 0, 1)
}
function DrawPoints(works, threshold, portWidth, portHeight) {
	works = works.filter(function (w) {
		return w.ministerialArticle
	})
	var yearRange = getYearRange(works);
	var filteredWorks = filterByMinisterial(works, Number.parseInt(threshold));
	var yearNodes = groupByYear(yearRange, filteredWorks);
	var scoreRange = getScoreRange(yearNodes);

	var svg = d3.select('#overlay-svg-port');

	var axisPadding = 25, barPadding = 10;

	console.log(yearRange)

	var xScale = d3.scaleLinear()
		.domain(yearRange.map(toDate))
		.range([axisPadding + barPadding, portWidth - axisPadding]);

	xScale(1990)
	var yScale = d3.scaleLinear()
		.domain(scoreRange)
		.range([axisPadding,portHeight - axisPadding].reverse());

	yScale(20);

	var overlayLines = svg.append('g').selectAll('line').data(yearNodes);
	var overlayBars = svg.append('g').selectAll('rect').data(yearNodes);

	console.log(yearNodes)

	var rectWidth = portWidth / (yearRange[1] - yearRange[0]) - barPadding;

	console.log(yScale(0))
	console.log(yScale(10))
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

	var xAxis = d3.axisBottom().scale(xScale).tickFormat(d3.timeFormat('%Y'));
	var yAxis = d3.axisLeft().scale(yScale);

	svg.append('g').call(xAxis)
		.attr('transform', 'translate(' + [0, portHeight - axisPadding] + ')')
	svg.append('g').call(yAxis)
		.attr('transform', 'translate(' + [axisPadding, 0] + ')')

	var overlayTip = d3.tip().attr('class', 'd3-tip').html(function(d, i) {
		return jsStrings.vis.year["1"] + ": " + yearNodes[i].year + '<br>' + yearNodes[i].titles.join("<br>") });
	svg.call(overlayTip);


}

function clearDisplay() {
	d3.select('#overlay-svg-port').selectAll('*').remove();
}

function getYearRange(works) {
	if(works.length === 0) return [0, 0];
	var min = works[0].year, max = works[0].year;

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
	var years = [], wIdx = 0;
	for (var year = yearRange[0]; year < yearRange[1]; year++) {
		var groupedPoints = 0,
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
	// console.log(rays)

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


	var xScale = d3.scaleOrdinal()
		.domain(years)
		.range(centres);

	var bubbleTip = d3.tip().attr('class', 'd3-tip').html(function(d, i) {
		return jsStrings.vis.year["1"] + ": " + years[i] + '<br>' + jsStrings.vis.page["many"] + ": " + data[i].pages });
	svg.call(bubbleTip);

	var pointBubbleTip = d3.tip().attr('class', 'd3-tip').html(function(d, i) {
		return jsStrings.vis.year["1"] + ": " + years[i] + '<br>' + jsStrings.vis.ministerial_score + ": " + data[i].points });
	svg.call(pointBubbleTip);


	///Drawing the axes
	var bottomYears=[], bottomCentres=[];
	var topYears=[], topCentres=[];
	var pointYears = [], pointCentres = [];


	// console.log(years);
	// console.log(centres)
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
			if(i % 2 === 0) return height;
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
		.range([height + ( (trueHeight - height) / 2), trueHeight - 10]);

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
			//console.log(points[i+1]);
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





/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc291cmNlcy9qcy9ncm91cC12aXN1YWxpc2F0aW9ucy9idWJibGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBLElBQUk7O0FBRUo7QUFDQTtBQUNBLElBQUk7QUFDSjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTs7QUFFQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHlHQUF5RztBQUN6Rzs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLHFCQUFxQjtBQUNuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOztBQUVGO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFOzs7QUFHRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpSEFBaUg7QUFDakg7O0FBRUE7QUFDQSx1SEFBdUg7QUFDdkg7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQSxzQkFBc0I7QUFDdEI7QUFDQSxtQkFBbUIsRUFBRTtBQUNyQjtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsbUJBQW1CO0FBQ25CO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7OztBQUdIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ3JvdXAtYnViYmxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc291cmNlcy9qcy9ncm91cC12aXN1YWxpc2F0aW9ucy9idWJibGVzLmpzXCIpO1xuIiwidmFyIGdEYXRhO1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuXHQkLnBvc3QoXCIvYnViYmxlc0RhdGFcIiwgZnVuY3Rpb24gKGRhdGEpIHtcblxuXHRcdFx0dmFyIHJlbW92ZWRDb3VudGVyICA9IDA7XG5cdFx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGludmFsaWRFbCwgaW52YWxpZEluZGV4LCBhcnIpIHtcblx0XHRcdFx0aWYoIWludmFsaWRFbC55ZWFyIHx8IGludmFsaWRFbC5wYWdlQW1vdW50IDwgMCkgey8vY29uc29sZS5sb2coJ0ludmFsaWQgcmVjb3JkOiAnICsgaW52YWxpZEluZGV4KTtcblx0XHRcdFx0XHRkYXRhLnNwbGljZShpbnZhbGlkSW5kZXggKyByZW1vdmVkQ291bnRlciwgMSl9XG5cdFx0XHR9KTtcblxuXHRcdFx0ZGF0YSA9IGRhdGEuc29ydChmdW5jdGlvbiAoYSwgYikge1xuXHRcdFx0XHRpZihhLnllYXIgJiYgYi55ZWFyKSByZXR1cm4gKGEueWVhciA+IGIueWVhcikgLSAoYS55ZWFyIDwgYi55ZWFyKTtcblx0XHRcdH0pO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblxuXHRcdFx0dmFyIFBhZ2VDb3VudHNHcm91cGVkQnlZZWFyID0gW107XG5cdFx0XHRQYWdlQ291bnRzR3JvdXBlZEJ5WWVhclswXSA9IHtcblx0XHRcdFx0eWVhcjogZGF0YVswXS55ZWFyLFxuXHRcdFx0XHRwYWdlczogMCxcblx0XHRcdFx0cG9pbnRzOiAwXG5cdFx0XHR9O1xuXG5cdFx0XHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG5cdFx0XHRcdGlmKGVsLnBhZ2VBbW91bnQgPCAwKSBlbC5wYWdlQW1vdW50ID0gMDtcblx0XHRcdFx0dmFyIGxhc3QgPSBQYWdlQ291bnRzR3JvdXBlZEJ5WWVhci5sZW5ndGggLSAxO1xuXHRcdFx0XHRpZihQYWdlQ291bnRzR3JvdXBlZEJ5WWVhcltsYXN0XS55ZWFyID09PSBlbC55ZWFyKSB7XG5cdFx0XHRcdFx0UGFnZUNvdW50c0dyb3VwZWRCeVllYXJbbGFzdF0ucGFnZXMgKz0gZWwucGFnZUFtb3VudDtcblx0XHRcdFx0XHRQYWdlQ291bnRzR3JvdXBlZEJ5WWVhcltsYXN0XS5wb2ludHMgKz0gZWwucG9pbnRzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgUGFnZUNvdW50c0dyb3VwZWRCeVllYXIucHVzaCh7XG5cdFx0XHRcdFx0eWVhcjogZWwueWVhcixcblx0XHRcdFx0XHRwYWdlczogZWwucGFnZUFtb3VudCxcblx0XHRcdFx0XHRwb2ludHM6IGVsLnBvaW50c1xuXHRcdFx0XHR9KVxuXHRcdFx0fSk7XG5cdFx0XHRnRGF0YSA9IGRhdGE7XG5cdFx0XHQkYnV0dG9uSG9zdCA9ICQoJyNnZW5QZGZCdG4nKS5wYXJlbnQoKTtcblx0XHRcdCRidXR0b25Ib3N0LmFwcGVuZChcIjxidXR0b24gY2xhc3M9J2J0biBsaW5lLWJ0bicgb25jbGljaz0nc2hvd092ZXJsYXlXcmFwcGVyKCknPlwiICsganNTdHJpbmdzLm1pbmlzdGVyaWFsX3BvaW50cyArIFwiPC9idXR0b24+XCIpXG5cdFx0XHRkcmF3QnViYmxlR3JhcGgoUGFnZUNvdW50c0dyb3VwZWRCeVllYXIpXG5cdFx0fVxuXG5cdCl9KTtcbmZ1bmN0aW9uIHNob3dPdmVybGF5V3JhcHBlcigpIHtcblx0c2hvd092ZXJsYXkoZ0RhdGEpXG59XG5mdW5jdGlvbiBjbG9zZU92ZXJsYXkoKXtcblx0Y29uc29sZS5sb2coJ2Nsb3NpbmcnKVxuXHQkKCcuYmx1cicpLnJlbW92ZSgpXG59XG5mdW5jdGlvbiBzaG93T3ZlcmxheSh3b3Jrcykge1xuXHR2YXIgb3ZlcmxheSA9ICQoJycgK1xuXHRcdCc8ZGl2IGNsYXNzPVwiYmx1clwiPicgK1xuXHRcdCcgICA8ZGl2IGNsYXNzPVwib3ZlcmxheVwiPiAnICtcblx0XHQnICAgICAgIDxkaXYgY2xhc3M9XCJ0aXRsZS1iYXJcIj4nICtcblx0XHQnICAgICAgICAgICA8cCBjbGFzcz1cInRpdGxlXCI+JyArIGpzU3RyaW5ncy5taW5pc3RlcmlhbF9wb2ludHMgKyAnPC9wPicgK1xuXHRcdCcgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgb25jbGljaz1cImNsb3NlT3ZlcmxheSgpXCI+PGkgY2xhc3M9XCJjbG9zZS1idG4gZmEgZmEtdGltZXNcIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9hPicgK1xuXHRcdCdcdCAgICAgICAgPGlucHV0IGlkPVwibWluaXN0ZXJpYWwtc2xpZGVyXCIgdHlwZT1cInJhbmdlXCIgbWluPVwiMFwiIG1heD1cIjUwXCIgc3RlcD1cIjFcIiAvPicgK1xuXHRcdCcgICAgICAgICAgIDxwIGlkPVwibWluaXN0ZXJpYWwtZGlzcGxheVwiPjI1PC9wPicgK1xuXHRcdCcgICAgICAgICAgIDxwIGlkPVwibWluaXN0ZXJpYWwtbGFiZWxcIj4nICsganNTdHJpbmdzLnBvaW50X3RocmVzaG9sZCArICc8L3A+JyArXG5cdFx0JyAgICAgICA8L2Rpdj4nICtcblx0XHQnICAgICAgIDxzdmcgaWQ9XCJvdmVybGF5LXN2Zy1wb3J0XCI+PC9zdmc+JyArXG5cdFx0JyAgIDwvZGl2PicgK1xuXHRcdCc8L2Rpdj4nKTtcblx0b3ZlcmxheS5hcHBlbmRUbyhkb2N1bWVudC5ib2R5KVxuXG5cdHZhciBzbGlkZXIgPSAkKCcjbWluaXN0ZXJpYWwtc2xpZGVyJyk7XG5cdHZhciBkaXNwbGF5ID0gJCgnI21pbmlzdGVyaWFsLWRpc3BsYXknKTtcblx0dmFyIHBvcnQgPSAkKCcjb3ZlcmxheS1zdmctcG9ydCcpXG5cblx0RHJhd1BvaW50cyh3b3Jrcywgc2xpZGVyLnZhbCgpLCBwb3J0LndpZHRoKCksIHBvcnQuaGVpZ2h0KCkpXG5cblx0c2xpZGVyLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcblx0XHRkaXNwbGF5LnRleHQoc2xpZGVyLnZhbCgpKVxuXHRcdGNsZWFyRGlzcGxheSgpXG5cdFx0RHJhd1BvaW50cyh3b3Jrcywgc2xpZGVyLnZhbCgpLCBwb3J0LndpZHRoKCksIHBvcnQuaGVpZ2h0KCkpXG5cdH0pXG5cbn1cbmZ1bmN0aW9uIHRvRGF0ZSh5ZWFyKXtcblx0cmV0dXJuIG5ldyBEYXRlKHllYXIsIDAsIDEpXG59XG5mdW5jdGlvbiBEcmF3UG9pbnRzKHdvcmtzLCB0aHJlc2hvbGQsIHBvcnRXaWR0aCwgcG9ydEhlaWdodCkge1xuXHR3b3JrcyA9IHdvcmtzLmZpbHRlcihmdW5jdGlvbiAodykge1xuXHRcdHJldHVybiB3Lm1pbmlzdGVyaWFsQXJ0aWNsZVxuXHR9KVxuXHR2YXIgeWVhclJhbmdlID0gZ2V0WWVhclJhbmdlKHdvcmtzKTtcblx0dmFyIGZpbHRlcmVkV29ya3MgPSBmaWx0ZXJCeU1pbmlzdGVyaWFsKHdvcmtzLCBOdW1iZXIucGFyc2VJbnQodGhyZXNob2xkKSk7XG5cdHZhciB5ZWFyTm9kZXMgPSBncm91cEJ5WWVhcih5ZWFyUmFuZ2UsIGZpbHRlcmVkV29ya3MpO1xuXHR2YXIgc2NvcmVSYW5nZSA9IGdldFNjb3JlUmFuZ2UoeWVhck5vZGVzKTtcblxuXHR2YXIgc3ZnID0gZDMuc2VsZWN0KCcjb3ZlcmxheS1zdmctcG9ydCcpO1xuXG5cdHZhciBheGlzUGFkZGluZyA9IDI1LCBiYXJQYWRkaW5nID0gMTA7XG5cblx0Y29uc29sZS5sb2coeWVhclJhbmdlKVxuXG5cdHZhciB4U2NhbGUgPSBkMy5zY2FsZUxpbmVhcigpXG5cdFx0LmRvbWFpbih5ZWFyUmFuZ2UubWFwKHRvRGF0ZSkpXG5cdFx0LnJhbmdlKFtheGlzUGFkZGluZyArIGJhclBhZGRpbmcsIHBvcnRXaWR0aCAtIGF4aXNQYWRkaW5nXSk7XG5cblx0eFNjYWxlKDE5OTApXG5cdHZhciB5U2NhbGUgPSBkMy5zY2FsZUxpbmVhcigpXG5cdFx0LmRvbWFpbihzY29yZVJhbmdlKVxuXHRcdC5yYW5nZShbYXhpc1BhZGRpbmcscG9ydEhlaWdodCAtIGF4aXNQYWRkaW5nXS5yZXZlcnNlKCkpO1xuXG5cdHlTY2FsZSgyMCk7XG5cblx0dmFyIG92ZXJsYXlMaW5lcyA9IHN2Zy5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ2xpbmUnKS5kYXRhKHllYXJOb2Rlcyk7XG5cdHZhciBvdmVybGF5QmFycyA9IHN2Zy5hcHBlbmQoJ2cnKS5zZWxlY3RBbGwoJ3JlY3QnKS5kYXRhKHllYXJOb2Rlcyk7XG5cblx0Y29uc29sZS5sb2coeWVhck5vZGVzKVxuXG5cdHZhciByZWN0V2lkdGggPSBwb3J0V2lkdGggLyAoeWVhclJhbmdlWzFdIC0geWVhclJhbmdlWzBdKSAtIGJhclBhZGRpbmc7XG5cblx0Y29uc29sZS5sb2coeVNjYWxlKDApKVxuXHRjb25zb2xlLmxvZyh5U2NhbGUoMTApKVxuXHRvdmVybGF5QmFycy5lbnRlcigpXG5cdFx0LmFwcGVuZCgncmVjdCcpXG5cdFx0Ly8gLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIFsyMCwgLTEwXSArICcpJylcblx0XHQuYXR0cigneCcsIGZ1bmN0aW9uIChkKSB7XG5cdFx0XHRyZXR1cm4geFNjYWxlKHRvRGF0ZShkLnllYXIpKSAtIHJlY3RXaWR0aC8yO1xuXHRcdH0pXG5cdFx0LmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0cmV0dXJuIHlTY2FsZShkLnBvaW50cyk7XG5cdFx0fSlcblx0XHQuYXR0cignd2lkdGgnLCByZWN0V2lkdGgpXG5cdFx0LmF0dHIoJ2hlaWdodCcsIGZ1bmN0aW9uIChkKSB7XG5cdFx0XHRyZXR1cm4gcG9ydEhlaWdodCAtIHlTY2FsZShkLnBvaW50cykgLSBheGlzUGFkZGluZ1xuXG5cdFx0fSlcblx0XHQuYXR0cignZmlsbCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiAnIzI2MjdkNydcblx0XHR9KVxuXHRcdC8vIC5hdHRyKCdyJywgJzAnKVxuXHRcdC8vIC50cmFuc2l0aW9uKClcblx0XHQvLyAuZHVyYXRpb24oNTAwKVxuXHRcdC5hdHRyKCdyJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdHJldHVybiA2O1xuXHRcdH0pXG5cdFx0Lm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdFx0b3ZlcmxheVRpcC5zaG93KGQsIGkpO1xuXHRcdH0pXG5cdFx0Lm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uIChkLCBpKSB7XG5cdFx0XHRvdmVybGF5VGlwLmhpZGUoZCwgaSk7XG5cdFx0fSk7XG5cblx0dmFyIHhBeGlzID0gZDMuYXhpc0JvdHRvbSgpLnNjYWxlKHhTY2FsZSkudGlja0Zvcm1hdChkMy50aW1lRm9ybWF0KCclWScpKTtcblx0dmFyIHlBeGlzID0gZDMuYXhpc0xlZnQoKS5zY2FsZSh5U2NhbGUpO1xuXG5cdHN2Zy5hcHBlbmQoJ2cnKS5jYWxsKHhBeGlzKVxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBbMCwgcG9ydEhlaWdodCAtIGF4aXNQYWRkaW5nXSArICcpJylcblx0c3ZnLmFwcGVuZCgnZycpLmNhbGwoeUF4aXMpXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIFtheGlzUGFkZGluZywgMF0gKyAnKScpXG5cblx0dmFyIG92ZXJsYXlUaXAgPSBkMy50aXAoKS5hdHRyKCdjbGFzcycsICdkMy10aXAnKS5odG1sKGZ1bmN0aW9uKGQsIGkpIHtcblx0XHRyZXR1cm4ganNTdHJpbmdzLnZpcy55ZWFyW1wiMVwiXSArIFwiOiBcIiArIHllYXJOb2Rlc1tpXS55ZWFyICsgJzxicj4nICsgeWVhck5vZGVzW2ldLnRpdGxlcy5qb2luKFwiPGJyPlwiKSB9KTtcblx0c3ZnLmNhbGwob3ZlcmxheVRpcCk7XG5cblxufVxuXG5mdW5jdGlvbiBjbGVhckRpc3BsYXkoKSB7XG5cdGQzLnNlbGVjdCgnI292ZXJsYXktc3ZnLXBvcnQnKS5zZWxlY3RBbGwoJyonKS5yZW1vdmUoKTtcbn1cblxuZnVuY3Rpb24gZ2V0WWVhclJhbmdlKHdvcmtzKSB7XG5cdGlmKHdvcmtzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFswLCAwXTtcblx0dmFyIG1pbiA9IHdvcmtzWzBdLnllYXIsIG1heCA9IHdvcmtzWzBdLnllYXI7XG5cblx0d29ya3MuZm9yRWFjaChmdW5jdGlvbiAod29yaykge1xuXHRcdGlmKHdvcmsueWVhciA8IG1pbikgbWluID0gd29yay55ZWFyO1xuXHRcdGlmKHdvcmsueWVhciA+IG1heCkgbWF4ID0gd29yay55ZWFyO1xuXHR9KTtcblxuXHRyZXR1cm4gW21pbiwgbWF4XVxufVxuZnVuY3Rpb24gZmlsdGVyQnlNaW5pc3RlcmlhbCh3b3JrcywgdGhyZXNob2xkKSB7XG5cdHJldHVybiB3b3Jrcy5maWx0ZXIoZnVuY3Rpb24gKHdvcmspIHtcblx0XHRyZXR1cm4gd29yay5wb2ludHMgPj0gdGhyZXNob2xkXG5cdH0pXG59XG5mdW5jdGlvbiBncm91cEJ5WWVhcih5ZWFyUmFuZ2UsIHdvcmtzKSB7XG5cdHZhciB5ZWFycyA9IFtdLCB3SWR4ID0gMDtcblx0Zm9yICh2YXIgeWVhciA9IHllYXJSYW5nZVswXTsgeWVhciA8IHllYXJSYW5nZVsxXTsgeWVhcisrKSB7XG5cdFx0dmFyIGdyb3VwZWRQb2ludHMgPSAwLFxuXHRcdFx0Z3JvdXBlZFRpdGxlcyA9IFtdO1xuXHRcdHdoaWxlKHdvcmtzW3dJZHhdICYmIHdvcmtzW3dJZHhdLnllYXIgPT09IHllYXIpIHtcblx0XHRcdGdyb3VwZWRQb2ludHMgKz0gd29ya3Nbd0lkeF0ucG9pbnRzO1xuXHRcdFx0Z3JvdXBlZFRpdGxlcy5wdXNoKHdvcmtzW3dJZHhdLnRpdGxlKTtcblx0XHRcdHdJZHgrKztcblxuXHRcdH1cblxuXHRcdHllYXJzLnB1c2goe1xuXHRcdFx0eWVhcjogeWVhcixcblx0XHRcdHBvaW50czogZ3JvdXBlZFBvaW50cyxcblx0XHRcdHRpdGxlczogZ3JvdXBlZFRpdGxlc1xuXHRcdH0pXG5cdH1cblxuXHRyZXR1cm4geWVhcnNcbn1cblxuZnVuY3Rpb24gZ2V0U2NvcmVSYW5nZSh3b3Jrcykge1xuXHRpZih3b3Jrcy5sZW5ndGggPT09IDApIHJldHVybiBbMCwgMF07XG5cdHZhciBtaW4gPSAwLCBtYXggPSAxMDtcblxuXHR3b3Jrcy5mb3JFYWNoKGZ1bmN0aW9uICh3b3JrKSB7XG5cdFx0aWYod29yay5wb2ludHMgPCBtaW4pIG1pbiA9IHdvcmsucG9pbnRzO1xuXHRcdGlmKHdvcmsucG9pbnRzID4gbWF4KSBtYXggPSB3b3JrLnBvaW50cztcblx0fSk7XG5cblx0cmV0dXJuIFttaW4sIG1heF1cbn1cbmZ1bmN0aW9uIGRyYXdCdWJibGVHcmFwaChkYXRhKSB7XG5cblx0dmFyIHN2ZyA9IGQzLnNlbGVjdCgnI3N2Zy1wb3J0Jyk7XG5cblx0dmFyIHdpZHRoID0gcGFyc2VJbnQoc3ZnLnN0eWxlKCd3aWR0aCcpLnJlcGxhY2UoJ3B4JywgJycpKSAtIDk2O1xuXHR2YXIgdHJ1ZUhlaWdodCA9IHBhcnNlSW50KHN2Zy5zdHlsZSgnaGVpZ2h0JykucmVwbGFjZSgncHgnLCAnJykpO1xuXHR2YXIgaGVpZ2h0ID0gMC44NSAqIHRydWVIZWlnaHQ7XG5cblxuXHR2YXIgc3VtT2ZQYWdlcyA9IDA7XG5cdHZhciBzdW1PZlBvaW50cyA9IDA7XG5cdHZhciB5ZWFycyA9IGRhdGEubWFwKGZ1bmN0aW9uIChlbCkge1xuXHRcdHN1bU9mUGFnZXMgKz0gTWF0aC5zcXJ0KGVsLnBhZ2VzKTtcblx0XHRzdW1PZlBvaW50cyArPSBNYXRoLnNxcnQoZWwucG9pbnRzKTtcblx0XHRyZXR1cm4gZWwueWVhcjtcblx0fSk7XG5cblx0dmFyIHJheXMgPSBbXTtcblx0ZGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuXHRcdHJheXMucHVzaCgoTWF0aC5zcXJ0KGVsLnBhZ2VzKSAvIHN1bU9mUGFnZXMpICogTWF0aC5taW4od2lkdGgsIGhlaWdodCkgKiAwLjgpO1xuXHR9KTtcblx0Ly8gY29uc29sZS5sb2cocmF5cylcblxuXHR2YXIgcG9pbnRzID0gW107XG5cdGRhdGEuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcblx0XHRwb2ludHMucHVzaChlbC5wb2ludHMpXG5cdH0pXG5cblx0dmFyIGNlbnRyZXMgPSBbXTtcblx0cmF5cy5mb3JFYWNoKGZ1bmN0aW9uIChlbCwgaW5kZXgpIHtcblx0XHRjZW50cmVzLnB1c2goMCk7XG5cblx0XHR2YXIgaSA9IDA7XG5cdFx0d2hpbGUgKGk8aW5kZXgpIHtcblx0XHRcdGNlbnRyZXNbY2VudHJlcy5sZW5ndGggLSAxXSArPSByYXlzW2ldKjI7XG5cdFx0XHRpKytcblx0XHR9XG5cdFx0Y2VudHJlc1tjZW50cmVzLmxlbmd0aCAtIDFdICs9IGVsO1xuXHR9KTtcblxuXG5cdHZhciB4U2NhbGUgPSBkMy5zY2FsZU9yZGluYWwoKVxuXHRcdC5kb21haW4oeWVhcnMpXG5cdFx0LnJhbmdlKGNlbnRyZXMpO1xuXG5cdHZhciBidWJibGVUaXAgPSBkMy50aXAoKS5hdHRyKCdjbGFzcycsICdkMy10aXAnKS5odG1sKGZ1bmN0aW9uKGQsIGkpIHtcblx0XHRyZXR1cm4ganNTdHJpbmdzLnZpcy55ZWFyW1wiMVwiXSArIFwiOiBcIiArIHllYXJzW2ldICsgJzxicj4nICsganNTdHJpbmdzLnZpcy5wYWdlW1wibWFueVwiXSArIFwiOiBcIiArIGRhdGFbaV0ucGFnZXMgfSk7XG5cdHN2Zy5jYWxsKGJ1YmJsZVRpcCk7XG5cblx0dmFyIHBvaW50QnViYmxlVGlwID0gZDMudGlwKCkuYXR0cignY2xhc3MnLCAnZDMtdGlwJykuaHRtbChmdW5jdGlvbihkLCBpKSB7XG5cdFx0cmV0dXJuIGpzU3RyaW5ncy52aXMueWVhcltcIjFcIl0gKyBcIjogXCIgKyB5ZWFyc1tpXSArICc8YnI+JyArIGpzU3RyaW5ncy52aXMubWluaXN0ZXJpYWxfc2NvcmUgKyBcIjogXCIgKyBkYXRhW2ldLnBvaW50cyB9KTtcblx0c3ZnLmNhbGwocG9pbnRCdWJibGVUaXApO1xuXG5cblx0Ly8vRHJhd2luZyB0aGUgYXhlc1xuXHR2YXIgYm90dG9tWWVhcnM9W10sIGJvdHRvbUNlbnRyZXM9W107XG5cdHZhciB0b3BZZWFycz1bXSwgdG9wQ2VudHJlcz1bXTtcblx0dmFyIHBvaW50WWVhcnMgPSBbXSwgcG9pbnRDZW50cmVzID0gW107XG5cblxuXHQvLyBjb25zb2xlLmxvZyh5ZWFycyk7XG5cdC8vIGNvbnNvbGUubG9nKGNlbnRyZXMpXG5cdHllYXJzLmZvckVhY2goZnVuY3Rpb24gKGVsLCBpbmRleCkge1xuXG5cdFx0cG9pbnRZZWFycy5wdXNoKHllYXJzW2luZGV4XSk7XG5cdFx0cG9pbnRDZW50cmVzLnB1c2goY2VudHJlc1tpbmRleF0pO1xuXG5cdFx0aWYoaW5kZXglMiA9PT0gMCkge1xuXHRcdFx0Ym90dG9tWWVhcnMucHVzaChlbCk7XG5cdFx0XHRib3R0b21DZW50cmVzLnB1c2goY2VudHJlc1tpbmRleF0pO1xuXHRcdH1cblx0XHRlbHNlIHtcblx0XHRcdHRvcFllYXJzLnB1c2goZWwpO1xuXHRcdFx0dG9wQ2VudHJlcy5wdXNoKGNlbnRyZXNbaW5kZXhdKTtcblx0XHR9XG5cdH0pO1xuXG5cdHZhciB4QXhpc1RvcCA9IGQzLmF4aXNUb3AoZDMuc2NhbGVPcmRpbmFsKCkucmFuZ2UodG9wQ2VudHJlcykuZG9tYWluKHRvcFllYXJzKSkudGlja0Zvcm1hdChmdW5jdGlvbiAoZCwgaSkge1xuXHRcdGlmKHRvcENlbnRyZXNbaV0gLSB0b3BDZW50cmVzW2ktMV0gPCAxMikgcmV0dXJuIFwiXCI7XG5cdFx0cmV0dXJuIGQ7XG5cdH0pO1xuXHR2YXIgeEF4aXNCb3R0b20gPSBkMy5heGlzQm90dG9tKGQzLnNjYWxlT3JkaW5hbCgpLnJhbmdlKGJvdHRvbUNlbnRyZXMpLmRvbWFpbihib3R0b21ZZWFycykpLnRpY2tGb3JtYXQoZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRpZihib3R0b21DZW50cmVzW2ldIC0gYm90dG9tQ2VudHJlc1tpLTFdIDwgMTApIHJldHVybiBcIlwiO1xuXHRcdHJldHVybiBkO1xuXHR9KTtcblx0dmFyIHhBeGlzUG9pbnRzID0gZDMuYXhpc0JvdHRvbShkMy5zY2FsZU9yZGluYWwoKS5yYW5nZShwb2ludENlbnRyZXMpLmRvbWFpbihwb2ludFllYXJzKSkudGlja0Zvcm1hdChmdW5jdGlvbiAoZCwgaSkge1xuXHRcdGlmKHBvaW50Q2VudHJlc1tpXSAtIHBvaW50Q2VudHJlc1tpLTFdIDwgMTApIHJldHVybiBcIlwiO1xuXHRcdHJldHVybiBkO1xuXHR9KTtcblxuXHR2YXIgYXhpc0dyb3VwVG9wID0gc3ZnLmFwcGVuZCgnZycpLmNhbGwoeEF4aXNUb3ApLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIFsyMCwgMjAgXSArICcpJyk7XG5cdHZhciBheGlzR3JvdXBCb3R0b20gPSBzdmcuYXBwZW5kKCdnJykuY2FsbCh4QXhpc0JvdHRvbSkuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgWzIwLCBoZWlnaHQgLTIwIF0gKyAnKScpO1xuXHR2YXIgYXhpc0dyb3VwUG9pbnRzID0gc3ZnLmFwcGVuZCgnZycpLmNhbGwoeEF4aXNQb2ludHMpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIFsyMCwgdHJ1ZUhlaWdodCAtIDIwXSArICcpJyk7XG5cblxuXHQvLy9EcmF3aW5nIHRoZSBndWlkZWxpbmVzXG5cdHZhciBsaW5lcyA9IHN2Zy5hcHBlbmQoJ2cnKVxuXHRcdC5zZWxlY3RBbGwoJ2xpbmUnKVxuXHRcdC5kYXRhKGNlbnRyZXMpXG5cdFx0LmVudGVyKClcblx0XHQuYXBwZW5kKCdsaW5lJylcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgWzIwLCAtMTBdICsgJyknKVxuXHRcdC5hdHRyKCdpZCcsIGZ1bmN0aW9uIChkLCBpKSB7XG5cdFx0XHRyZXR1cm4gJ2EnICsgZGF0YVtpXS55ZWFyO1xuXHRcdH0pXG5cdFx0LmF0dHIoJ3gxJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdHJldHVybiBjZW50cmVzW2ldIH0pXG5cdFx0LmF0dHIoJ3kxJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGhlaWdodC8yOyB9KVxuXHRcdC5hdHRyKCd4MicsIGZ1bmN0aW9uIChkLCBpKSB7XG5cdFx0XHRyZXR1cm4gY2VudHJlc1tpXX0pXG5cdFx0LmF0dHIoJ3kyJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdGlmKGkgJSAyID09PSAwKSByZXR1cm4gaGVpZ2h0O1xuXHRcdFx0ZWxzZSByZXR1cm4gMjAgfSlcblx0XHQuYXR0cignc3Ryb2tlJywgJ2JsYWNrJylcblx0XHQuYXR0cignc3Ryb2tlLWRhc2hhcnJheScsICc1LCA1Jylcblx0XHQuYXR0cignb3BhY2l0eScsICcwLjUnKTtcblxuXHQvLy9EcmF3aW5nIGJ1YmJsZXNcblx0dmFyIGJ1YmJsZXMgPSBzdmdcblx0XHQuc2VsZWN0QWxsKCdyZWN0Jylcblx0XHQuZGF0YShkYXRhKTtcblx0YnViYmxlcy5lbnRlcigpXG5cdFx0LmFwcGVuZCgnY2lyY2xlJylcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgWzIwLCAtMTBdICsgJyknKVxuXHRcdC5hdHRyKCdjeCcsIGZ1bmN0aW9uIChkKSB7XG5cdFx0XHRyZXR1cm4geFNjYWxlKGQueWVhcik7XG5cdFx0fSlcblx0XHQuYXR0cignY3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gaGVpZ2h0IC8gMjtcblx0XHR9KVxuXHRcdC5hdHRyKCdmaWxsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIE5leHRDb2xvcigpXG5cdFx0fSlcblx0XHQuYXR0cigncicsICcwJylcblx0XHQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChkLCBpKSB7XG5cdFx0XHRidWJibGVUaXAuc2hvdyhkLCBpKTtcblx0XHRcdGQzLnNlbGVjdChcIiNhXCIgKyBkLnllYXIpLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyMDApLmF0dHIoJ3N0cm9rZS13aWR0aCcsIDMpLmF0dHIoJ29wYWNpdHknLCAwLjcpXG5cdFx0fSlcblx0XHQub24oJ21vdXNlb3V0JywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdGJ1YmJsZVRpcC5oaWRlKGQsIGkpO1xuXHRcdFx0ZDMuc2VsZWN0KFwiI2FcIiArIGQueWVhcikudHJhbnNpdGlvbigpLmR1cmF0aW9uKDIwMCkuYXR0cignc3Ryb2tlLXdpZHRoJywgMSkuYXR0cignb3BhY2l0eScsIDAuNSlcblx0XHR9KVxuXHRcdC50cmFuc2l0aW9uKClcblx0XHQuZHVyYXRpb24oNTAwKVxuXHRcdC5hdHRyKCdyJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdHJldHVybiByYXlzW2ldO1xuXHRcdH0pXG5cblx0Ly8vRHJhd2luZyB0aGUgcG9pbnQgYnViYmxlc1xuXG5cdHZhciBwb2ludEhlaWdodFNjYWxlID0gZDMuc2NhbGVMaW5lYXIoKVxuXHRcdC5kb21haW4oW01hdGgubWF4KC4uLnBvaW50cyksIE1hdGgubWluKC4uLnBvaW50cyldKVxuXHRcdC5yYW5nZShbaGVpZ2h0ICsgKCAodHJ1ZUhlaWdodCAtIGhlaWdodCkgLyAyKSwgdHJ1ZUhlaWdodCAtIDEwXSk7XG5cblx0dmFyIHBvaW50QnViYmxlcyA9IHN2Z1xuXHRcdC5zZWxlY3RBbGwoJ3JlY3QnKVxuXHRcdC5kYXRhKGRhdGEpO1xuXG5cblxuXHRwb2ludEJ1YmJsZXMuZW50ZXIoKVxuXHRcdC5hcHBlbmQoJ2xpbmUnKVxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBbMjAsIC0xMF0gKyAnKScpXG5cdFx0LmF0dHIoJ3gxJywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdHJldHVybiB4U2NhbGUoZC55ZWFyKVxuXHRcdH0pXG5cdFx0LmF0dHIoJ3kxJywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdHJldHVybiBwb2ludEhlaWdodFNjYWxlKGQucG9pbnRzKVxuXHRcdH0pXG5cdFx0LmF0dHIoJ3gyJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdGlmKGkgPCBkYXRhLmxlbmd0aCAtIDEpXG5cdFx0XHRcdHJldHVybiB4U2NhbGUoZGF0YVtpKzFdLnllYXIpXG5cdFx0XHRlbHNlIHJldHVybiB4U2NhbGUoZGF0YVtpXS55ZWFyKTtcblx0XHR9KVxuXG5cdFx0LmF0dHIoJ3kyJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdC8vY29uc29sZS5sb2cocG9pbnRzW2krMV0pO1xuXHRcdFx0aWYoaSA8IGRhdGEubGVuZ3RoIC0gMSkgcmV0dXJuIHBvaW50SGVpZ2h0U2NhbGUocG9pbnRzW2krMV0pXG5cdFx0XHRlbHNlIHJldHVybiBwb2ludEhlaWdodFNjYWxlKHBvaW50c1tpXSk7XG5cdFx0fSlcblx0XHQuYXR0cignc3Ryb2tlLXdpZHRoJywgJzFweCcpXG5cdFx0LmF0dHIoJ3N0cm9rZScsICcjNTI1NjkwJylcblxuXHRwb2ludEJ1YmJsZXMuZW50ZXIoKVxuXHRcdC5hcHBlbmQoJ2NpcmNsZScpXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIFsyMCwgLTEwXSArICcpJylcblx0XHQuYXR0cignY3gnLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0cmV0dXJuIHhTY2FsZShkLnllYXIpO1xuXHRcdH0pXG5cdFx0LmF0dHIoJ2N5JywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdHJldHVybiBwb2ludEhlaWdodFNjYWxlKGQucG9pbnRzKTtcblx0XHR9KVxuXHRcdC5hdHRyKCdmaWxsJywgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuICcjMjYyN2Q3J1xuXHRcdH0pXG5cdFx0LmF0dHIoJ3InLCAnMCcpXG5cdFx0Lm9uKCdtb3VzZW92ZXInLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdFx0cG9pbnRCdWJibGVUaXAuc2hvdyhkLCBpKTtcblx0XHR9KVxuXHRcdC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoZCwgaSkge1xuXHRcdFx0cG9pbnRCdWJibGVUaXAuaGlkZShkLCBpKTtcblx0XHR9KVxuXHRcdC50cmFuc2l0aW9uKClcblx0XHQuZHVyYXRpb24oNTAwKVxuXHRcdC5hdHRyKCdyJywgZnVuY3Rpb24gKGQsIGkpIHtcblx0XHRcdHJldHVybiA0O1xuXHRcdH0pO1xuXG5cbn1cblxudmFyIGNvbG9yQ291bnRlciA9IDA7XG5mdW5jdGlvbiBOZXh0Q29sb3IoKSB7XG5cdGlmIChjb2xvckNvdW50ZXIgPj0gOSkgY29sb3JDb3VudGVyID0gMDtcblx0cmV0dXJuIGQzLnNjaGVtZVNldDJbY29sb3JDb3VudGVyKytdO1xufVxuXG5cblxuIl0sInNvdXJjZVJvb3QiOiIifQ==