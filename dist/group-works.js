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
/******/ 	return __webpack_require__(__webpack_require__.s = "./sources/js/group-visualisations/works.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./sources/js/group-visualisations/works.js":
/*!**************************************************!*\
  !*** ./sources/js/group-visualisations/works.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

$(document).ready(function () {
	$.post("worksData", function (data) {
		// console.log(jsStrings)
			var barData = getBars(data);
			drawWorksOverTimeGraph(barData);
			displayWorkStatsWorksInTime(barData);
		}
	)
});

function drawWorksOverTimeGraph(data) {
	var red = "#f44336";
	var blue = "#26a69a";
	var stackMargin = 10;
	var svg = d3.select("#svg-port"),
		width = $(".svg-port").width(),
		height = $(".svg-port").height();
	svg.selectAll('*').remove();
	var barYearTip = d3.tip().attr('class', 'd3-tip').html(function (d) {
		return jsStrings.vis.year["1"] + " " + d.year + ': ' + d.works + " " + multiple(jsStrings.vis.work, d.works) +
		'.</br> ' + jsStrings.vis.including + " " + d.books + ' ' + jsStrings.vis.monographies + "."
	});
	svg.call(barYearTip);

	var maxBarHeight = height / 2;
	var maxBarWidth = width;
	var yScaleWidth = 30;
	var xScale = d3.scaleBand()
		.domain(data.map(function (el) {
			return el.year;
		}))
		.range([0, maxBarWidth - yScaleWidth])
		.paddingInner(0.1)
		.paddingOuter(0.2)
	var yScale = d3.scaleLinear()
		.domain([0, d3.max(data, function (d) {
			return d.works
		})])
		.range([0, maxBarHeight]);
	var colorScale = d3.scaleSequential(d3.interpolateCool)
		.domain([d3.min(data, function (el) {
			return el.year
		}), d3.max(data, function (el) {
			return el.year
		})]);

	if (svg.select('g').empty()) svg.append('g').attr('id', 'bars');
	var bars = svg.select('g')
		.selectAll('rect')
		.data(data);
	bars.enter().append('rect')
		.attr('width', xScale.bandwidth())
		.attr('x', function (d) {
			return xScale(d.year);
		})
		.attr('y', maxBarHeight)
		.attr('height', 0)
		.style('fill', '#FFFFFF')
		.attr('transform', 'translate( ' + [yScaleWidth, maxBarHeight - 20] + ')')
		.on('mouseover', barYearTip.show)
		.on('mouseout', barYearTip.hide)
		.transition()
		.duration(1000)
		.attr('y', function (d) {
			return maxBarHeight - yScale(d.articles);
		})
		.attr('height', function (d) {
			return yScale(d.articles);
		})
		.style('fill', '#8BC34A');
	bars.enter().append('rect')
		.attr('width', xScale.bandwidth())
		.attr('x', function (d) {
			return xScale(d.year);
		})
		.attr('y', function (d) {
			if (d.articles > 0) return maxBarHeight - yScale(d.works) - stackMargin;
			else return maxBarHeight - yScale(d.works)
		})
		.attr('height', 0)
		.style('fill', red)
		.attr('transform', 'translate( ' + [yScaleWidth, maxBarHeight - 20] + ')')
		.on('mouseover', barYearTip.show)
		.on('mouseout', barYearTip.hide)
		.transition()
		.duration(1000)
		.attr('y', function (d) {
			if (d.articles > 0) return maxBarHeight - yScale(d.works - d.edits) - stackMargin;
			else return maxBarHeight - yScale(d.works)
		})
		.attr('height', function (d) {
			return yScale(d.books);
		});
	bars.enter().append('rect')
		.attr('width', xScale.bandwidth())
		.attr('x', function (d) {
			return xScale(d.year);
		})
		.attr('y', function (d) {
			if (d.articles > 0 || d.books > 0) return maxBarHeight - yScale(d.works) - stackMargin;
			else return maxBarHeight - yScale(d.works)
		})
		.attr('height', 0)
		.style('fill', 'yellow')
		.attr('transform', 'translate( ' + [yScaleWidth, maxBarHeight - 20] + ')')
		.on('mouseover', barYearTip.show)
		.on('mouseout', barYearTip.hide)
		.transition()
		.duration(1000)
		.attr('y', function (d) {
			if (d.articles > 0 && d.books > 0) return maxBarHeight - yScale(d.works) - 2*stackMargin;
			else if (d.articles > 0 || d.books > 0) return maxBarHeight - yScale(d.works) - stackMargin;
			else return maxBarHeight - yScale(d.edits)
		})
		.attr('height', function (d) {
			return yScale(d.edits);
		})
//                .style('fill', '#8BC34A');

	bars.exit()
		.transition()
		.duration(300)
		.attr('width', 0)
		.remove();
	var xAxis = d3.axisBottom(xScale);
	svg.append('g').attr('id', 'x-axis').call(xAxis).attr('transform', 'translate( ' + [-width, height / 2] + ')').transition().duration(1000).attr('transform', 'translate( ' + [yScaleWidth, height - 20] + ')');
	var yAxis = d3.axisLeft(yScale.domain(yScale.domain().reverse()));
	svg.append('g').attr('id', 'y-axis').call(yAxis).attr('transform', 'translate( ' + [0, height * 2] + ')').transition().duration(1000).attr('transform', 'translate( ' + [30, height - maxBarHeight - 20] + ')');
	//svg.select('g').call(xAxis).attr('width', 0).transition().duration(1000).attr('width', width);

}

function ConvertDbOutputIntoLegacyExpertusFormat(data, mainName) { //[ {authors: [author1, author2]} ]
	var LegacyCollaboratorList = [];

	data.forEach(function (work) {
		var singleWorkAuthors = [];
		work.authors.forEach(function (author) {
			if (author != mainName) singleWorkAuthors.push(author);
		});
		LegacyCollaboratorList.push(singleWorkAuthors)
	});

	return LegacyCollaboratorList
}

function getBars(allWorks) {
	allWorks = allWorks.map(function (el) {
		if (Number.parseInt(el.year) < 1900) {
			el.year = Number.parseInt(el.year) - (-1000);
		}
		else el.year = Number.parseInt(el.year);
		return el;
	});

	allWorks.sort(dynamicSort('year'));


	var bars = [];
	
	for (var i = 0; i < (allWorks[allWorks.length - 1].year - allWorks[0].year - (-1)); i++) {
		bars.push(countYearOccurences(allWorks[0].year - (-i), allWorks))
	}

	return bars;
}

function countYearOccurences(year, arr) {
	var resObj = {
		works: 0,
		articles: 0,
		books: 0,
		edits: 0,
		year: year,
		titles: []
	};
	arr.forEach(function (el) {
		if (el.year === year) {
			resObj.works++;
			if(el.publicationType === 'book') resObj.books++;
			if(el.publicationType === 'edit') {
				resObj.edits++;
				// console.log('Pushing ' + el.title)
				resObj.titles.push(el.title);
			}
			if(el.publicationType === 'article') resObj.articles++;
		}
	});
	return resObj;
}

function incrementCollaboration(arr, name) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].name === name) {
			arr[i].works++;
			return
		}
	}
}

function getCompleteCollaboratorList(allWorks) {

	var allCollaborators = [];
	var allCollaboratorsWithAmounts = [];
	var collaborationAmountArray = [];
	allWorks.forEach(function (work) {
		work.forEach(function (person) {
			if (!allCollaborators.includes(person)) {
				allCollaborators.push(person);
				collaborationAmountArray.push(
					{
						name: person,
						amount: 0
					})
			}

		})
	});

	allCollaborators.forEach(function (person) {
		allCollaboratorsWithAmounts.push(
			{
				name: person,
				collaborations: JSON.parse(JSON.stringify(collaborationAmountArray))
			})
	});


	allCollaboratorsWithAmounts.forEach(function (collaborator, index, arr) {
		for (var i = 0; i < allWorks.length; i++) {
			if (allWorks[i].includes(collaborator.name)) {
				allWorks[i].forEach(function (person) {
					incrementCollaboration(collaborator.collaborations, person);
				});
			}
		}
	});

	return allCollaboratorsWithAmounts;
}

function compareCollaboratorsByAmount(a, b) {
	if (a.amount < b.amount) {
		return -1;
	}
	if (a.amount > b.amount) {
		return 1;
	}
	return 0;
}

function clearSvg() {
	d3.select('svg').selectAll('*').remove();
}
function DeclinatePolishWordPraca(word, number) {
	switch (word) {
		case 'praca':
			if (number === 1) return number + ' praca'
			if (number >= 2 && number <= 4) return number + ' prace'
			return number + ' prac'
		case 'redagowana':
			if (number === 1) return ' redagowana'
			if (number >= 2 && number <= 4) return ' redagowane'
			return ' redagowanych';
	}

}

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}
function displayWorkStatsWorksInTime(data) {

	var displayValues = {
		meanPerYear: 0,
		sumOfWorks: 0,
		sumOfArticles: 0
	};

	data.forEach(function (year, index) {
		displayValues.sumOfWorks += Number.parseInt(year.works);
		displayValues.sumOfArticles += Number.parseInt(year.articles);
	});
	displayValues.meanPerYear = displayValues.sumOfWorks / data.length;


	$('#mean-works-amount-display').text(displayValues.meanPerYear.toFixed(2));
	$('#publications-amount-display').text(displayValues.sumOfArticles);
	$('#works-amount-display').text(displayValues.sumOfWorks);
}

/*
function genPdfDoc() {
	var $svg = document.querySelector('#svg-port')
		, doc = new PDFDocument({
		layout: 'landscape'
	})
		, stream = doc.pipe(blobStream());
	doc.fontSize(25)
		.text('Liczba publikacji w czasie', 100, 40);
	doc.fontSize(12)
		.text('Wygenerowano przez ', {
			continued: true
		})
		.text('Wizualizator Dorobku Naukowego', {
			continued: true,
			link: 'http://visualizeme.umk.pl'
		})
		.text(' dla ' + authorName.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));


	var scale = doc.page.width / $svg.width.baseVal.value;
	var width = $svg.width.baseVal.value;
	var height = $svg.height.baseVal.value;
	console.log(scale);
//        $svg = $svg.cloneNode(true);
	$svg.setAttribute('transform', 'scale(' + scale + ')');

	SVGtoPDF(doc, $svg, 100, 0, {width: width, height: height});





	stream.on('finish', function() {
		console.log(stream.toBlobURL('application/pdf'));
		window.location = stream.toBlobURL('application/pdf');
	});
	doc.end();

}*/


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc291cmNlcy9qcy9ncm91cC12aXN1YWxpc2F0aW9ucy93b3Jrcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFBRTtRQUNySTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDJCQUEyQiwwQkFBMEIsRUFBRTtRQUN2RCxpQ0FBaUMsZUFBZTtRQUNoRDtRQUNBO1FBQ0E7O1FBRUE7UUFDQSxzREFBc0QsK0RBQStEOztRQUVySDtRQUNBOzs7UUFHQTtRQUNBOzs7Ozs7Ozs7Ozs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLGtFQUFrRSxNQUFNLDRCQUE0QjtBQUNwRzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLEVBQUU7O0FBRUY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7O0FBRUY7OztBQUdBOztBQUVBLGdCQUFnQixvRUFBb0U7QUFDcEY7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTs7QUFFQTtBQUNBLGdCQUFnQixnQkFBZ0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047O0FBRUEsR0FBRztBQUNILEVBQUU7O0FBRUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSixFQUFFOzs7QUFHRjtBQUNBLGlCQUFpQixxQkFBcUI7QUFDdEM7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxFQUFFOztBQUVGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4QkFBOEIsNkJBQTZCOzs7Ozs7QUFNM0Q7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGOztBQUVBLENBQUMiLCJmaWxlIjoiZ3JvdXAtd29ya3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NvdXJjZXMvanMvZ3JvdXAtdmlzdWFsaXNhdGlvbnMvd29ya3MuanNcIik7XG4iLCIkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdCQucG9zdChcIndvcmtzRGF0YVwiLCBmdW5jdGlvbiAoZGF0YSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKGpzU3RyaW5ncylcblx0XHRcdHZhciBiYXJEYXRhID0gZ2V0QmFycyhkYXRhKTtcblx0XHRcdGRyYXdXb3Jrc092ZXJUaW1lR3JhcGgoYmFyRGF0YSk7XG5cdFx0XHRkaXNwbGF5V29ya1N0YXRzV29ya3NJblRpbWUoYmFyRGF0YSk7XG5cdFx0fVxuXHQpXG59KTtcblxuZnVuY3Rpb24gZHJhd1dvcmtzT3ZlclRpbWVHcmFwaChkYXRhKSB7XG5cdHZhciByZWQgPSBcIiNmNDQzMzZcIjtcblx0dmFyIGJsdWUgPSBcIiMyNmE2OWFcIjtcblx0dmFyIHN0YWNrTWFyZ2luID0gMTA7XG5cdHZhciBzdmcgPSBkMy5zZWxlY3QoXCIjc3ZnLXBvcnRcIiksXG5cdFx0d2lkdGggPSAkKFwiLnN2Zy1wb3J0XCIpLndpZHRoKCksXG5cdFx0aGVpZ2h0ID0gJChcIi5zdmctcG9ydFwiKS5oZWlnaHQoKTtcblx0c3ZnLnNlbGVjdEFsbCgnKicpLnJlbW92ZSgpO1xuXHR2YXIgYmFyWWVhclRpcCA9IGQzLnRpcCgpLmF0dHIoJ2NsYXNzJywgJ2QzLXRpcCcpLmh0bWwoZnVuY3Rpb24gKGQpIHtcblx0XHRyZXR1cm4ganNTdHJpbmdzLnZpcy55ZWFyW1wiMVwiXSArIFwiIFwiICsgZC55ZWFyICsgJzogJyArIGQud29ya3MgKyBcIiBcIiArIG11bHRpcGxlKGpzU3RyaW5ncy52aXMud29yaywgZC53b3JrcykgK1xuXHRcdCcuPC9icj4gJyArIGpzU3RyaW5ncy52aXMuaW5jbHVkaW5nICsgXCIgXCIgKyBkLmJvb2tzICsgJyAnICsganNTdHJpbmdzLnZpcy5tb25vZ3JhcGhpZXMgKyBcIi5cIlxuXHR9KTtcblx0c3ZnLmNhbGwoYmFyWWVhclRpcCk7XG5cblx0dmFyIG1heEJhckhlaWdodCA9IGhlaWdodCAvIDI7XG5cdHZhciBtYXhCYXJXaWR0aCA9IHdpZHRoO1xuXHR2YXIgeVNjYWxlV2lkdGggPSAzMDtcblx0dmFyIHhTY2FsZSA9IGQzLnNjYWxlQmFuZCgpXG5cdFx0LmRvbWFpbihkYXRhLm1hcChmdW5jdGlvbiAoZWwpIHtcblx0XHRcdHJldHVybiBlbC55ZWFyO1xuXHRcdH0pKVxuXHRcdC5yYW5nZShbMCwgbWF4QmFyV2lkdGggLSB5U2NhbGVXaWR0aF0pXG5cdFx0LnBhZGRpbmdJbm5lcigwLjEpXG5cdFx0LnBhZGRpbmdPdXRlcigwLjIpXG5cdHZhciB5U2NhbGUgPSBkMy5zY2FsZUxpbmVhcigpXG5cdFx0LmRvbWFpbihbMCwgZDMubWF4KGRhdGEsIGZ1bmN0aW9uIChkKSB7XG5cdFx0XHRyZXR1cm4gZC53b3Jrc1xuXHRcdH0pXSlcblx0XHQucmFuZ2UoWzAsIG1heEJhckhlaWdodF0pO1xuXHR2YXIgY29sb3JTY2FsZSA9IGQzLnNjYWxlU2VxdWVudGlhbChkMy5pbnRlcnBvbGF0ZUNvb2wpXG5cdFx0LmRvbWFpbihbZDMubWluKGRhdGEsIGZ1bmN0aW9uIChlbCkge1xuXHRcdFx0cmV0dXJuIGVsLnllYXJcblx0XHR9KSwgZDMubWF4KGRhdGEsIGZ1bmN0aW9uIChlbCkge1xuXHRcdFx0cmV0dXJuIGVsLnllYXJcblx0XHR9KV0pO1xuXG5cdGlmIChzdmcuc2VsZWN0KCdnJykuZW1wdHkoKSkgc3ZnLmFwcGVuZCgnZycpLmF0dHIoJ2lkJywgJ2JhcnMnKTtcblx0dmFyIGJhcnMgPSBzdmcuc2VsZWN0KCdnJylcblx0XHQuc2VsZWN0QWxsKCdyZWN0Jylcblx0XHQuZGF0YShkYXRhKTtcblx0YmFycy5lbnRlcigpLmFwcGVuZCgncmVjdCcpXG5cdFx0LmF0dHIoJ3dpZHRoJywgeFNjYWxlLmJhbmR3aWR0aCgpKVxuXHRcdC5hdHRyKCd4JywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdHJldHVybiB4U2NhbGUoZC55ZWFyKTtcblx0XHR9KVxuXHRcdC5hdHRyKCd5JywgbWF4QmFySGVpZ2h0KVxuXHRcdC5hdHRyKCdoZWlnaHQnLCAwKVxuXHRcdC5zdHlsZSgnZmlsbCcsICcjRkZGRkZGJylcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSggJyArIFt5U2NhbGVXaWR0aCwgbWF4QmFySGVpZ2h0IC0gMjBdICsgJyknKVxuXHRcdC5vbignbW91c2VvdmVyJywgYmFyWWVhclRpcC5zaG93KVxuXHRcdC5vbignbW91c2VvdXQnLCBiYXJZZWFyVGlwLmhpZGUpXG5cdFx0LnRyYW5zaXRpb24oKVxuXHRcdC5kdXJhdGlvbigxMDAwKVxuXHRcdC5hdHRyKCd5JywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdHJldHVybiBtYXhCYXJIZWlnaHQgLSB5U2NhbGUoZC5hcnRpY2xlcyk7XG5cdFx0fSlcblx0XHQuYXR0cignaGVpZ2h0JywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdHJldHVybiB5U2NhbGUoZC5hcnRpY2xlcyk7XG5cdFx0fSlcblx0XHQuc3R5bGUoJ2ZpbGwnLCAnIzhCQzM0QScpO1xuXHRiYXJzLmVudGVyKCkuYXBwZW5kKCdyZWN0Jylcblx0XHQuYXR0cignd2lkdGgnLCB4U2NhbGUuYmFuZHdpZHRoKCkpXG5cdFx0LmF0dHIoJ3gnLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0cmV0dXJuIHhTY2FsZShkLnllYXIpO1xuXHRcdH0pXG5cdFx0LmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0aWYgKGQuYXJ0aWNsZXMgPiAwKSByZXR1cm4gbWF4QmFySGVpZ2h0IC0geVNjYWxlKGQud29ya3MpIC0gc3RhY2tNYXJnaW47XG5cdFx0XHRlbHNlIHJldHVybiBtYXhCYXJIZWlnaHQgLSB5U2NhbGUoZC53b3Jrcylcblx0XHR9KVxuXHRcdC5hdHRyKCdoZWlnaHQnLCAwKVxuXHRcdC5zdHlsZSgnZmlsbCcsIHJlZClcblx0XHQuYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSggJyArIFt5U2NhbGVXaWR0aCwgbWF4QmFySGVpZ2h0IC0gMjBdICsgJyknKVxuXHRcdC5vbignbW91c2VvdmVyJywgYmFyWWVhclRpcC5zaG93KVxuXHRcdC5vbignbW91c2VvdXQnLCBiYXJZZWFyVGlwLmhpZGUpXG5cdFx0LnRyYW5zaXRpb24oKVxuXHRcdC5kdXJhdGlvbigxMDAwKVxuXHRcdC5hdHRyKCd5JywgZnVuY3Rpb24gKGQpIHtcblx0XHRcdGlmIChkLmFydGljbGVzID4gMCkgcmV0dXJuIG1heEJhckhlaWdodCAtIHlTY2FsZShkLndvcmtzIC0gZC5lZGl0cykgLSBzdGFja01hcmdpbjtcblx0XHRcdGVsc2UgcmV0dXJuIG1heEJhckhlaWdodCAtIHlTY2FsZShkLndvcmtzKVxuXHRcdH0pXG5cdFx0LmF0dHIoJ2hlaWdodCcsIGZ1bmN0aW9uIChkKSB7XG5cdFx0XHRyZXR1cm4geVNjYWxlKGQuYm9va3MpO1xuXHRcdH0pO1xuXHRiYXJzLmVudGVyKCkuYXBwZW5kKCdyZWN0Jylcblx0XHQuYXR0cignd2lkdGgnLCB4U2NhbGUuYmFuZHdpZHRoKCkpXG5cdFx0LmF0dHIoJ3gnLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0cmV0dXJuIHhTY2FsZShkLnllYXIpO1xuXHRcdH0pXG5cdFx0LmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0aWYgKGQuYXJ0aWNsZXMgPiAwIHx8IGQuYm9va3MgPiAwKSByZXR1cm4gbWF4QmFySGVpZ2h0IC0geVNjYWxlKGQud29ya3MpIC0gc3RhY2tNYXJnaW47XG5cdFx0XHRlbHNlIHJldHVybiBtYXhCYXJIZWlnaHQgLSB5U2NhbGUoZC53b3Jrcylcblx0XHR9KVxuXHRcdC5hdHRyKCdoZWlnaHQnLCAwKVxuXHRcdC5zdHlsZSgnZmlsbCcsICd5ZWxsb3cnKVxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCAnICsgW3lTY2FsZVdpZHRoLCBtYXhCYXJIZWlnaHQgLSAyMF0gKyAnKScpXG5cdFx0Lm9uKCdtb3VzZW92ZXInLCBiYXJZZWFyVGlwLnNob3cpXG5cdFx0Lm9uKCdtb3VzZW91dCcsIGJhclllYXJUaXAuaGlkZSlcblx0XHQudHJhbnNpdGlvbigpXG5cdFx0LmR1cmF0aW9uKDEwMDApXG5cdFx0LmF0dHIoJ3knLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0aWYgKGQuYXJ0aWNsZXMgPiAwICYmIGQuYm9va3MgPiAwKSByZXR1cm4gbWF4QmFySGVpZ2h0IC0geVNjYWxlKGQud29ya3MpIC0gMipzdGFja01hcmdpbjtcblx0XHRcdGVsc2UgaWYgKGQuYXJ0aWNsZXMgPiAwIHx8IGQuYm9va3MgPiAwKSByZXR1cm4gbWF4QmFySGVpZ2h0IC0geVNjYWxlKGQud29ya3MpIC0gc3RhY2tNYXJnaW47XG5cdFx0XHRlbHNlIHJldHVybiBtYXhCYXJIZWlnaHQgLSB5U2NhbGUoZC5lZGl0cylcblx0XHR9KVxuXHRcdC5hdHRyKCdoZWlnaHQnLCBmdW5jdGlvbiAoZCkge1xuXHRcdFx0cmV0dXJuIHlTY2FsZShkLmVkaXRzKTtcblx0XHR9KVxuLy8gICAgICAgICAgICAgICAgLnN0eWxlKCdmaWxsJywgJyM4QkMzNEEnKTtcblxuXHRiYXJzLmV4aXQoKVxuXHRcdC50cmFuc2l0aW9uKClcblx0XHQuZHVyYXRpb24oMzAwKVxuXHRcdC5hdHRyKCd3aWR0aCcsIDApXG5cdFx0LnJlbW92ZSgpO1xuXHR2YXIgeEF4aXMgPSBkMy5heGlzQm90dG9tKHhTY2FsZSk7XG5cdHN2Zy5hcHBlbmQoJ2cnKS5hdHRyKCdpZCcsICd4LWF4aXMnKS5jYWxsKHhBeGlzKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCAnICsgWy13aWR0aCwgaGVpZ2h0IC8gMl0gKyAnKScpLnRyYW5zaXRpb24oKS5kdXJhdGlvbigxMDAwKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCAnICsgW3lTY2FsZVdpZHRoLCBoZWlnaHQgLSAyMF0gKyAnKScpO1xuXHR2YXIgeUF4aXMgPSBkMy5heGlzTGVmdCh5U2NhbGUuZG9tYWluKHlTY2FsZS5kb21haW4oKS5yZXZlcnNlKCkpKTtcblx0c3ZnLmFwcGVuZCgnZycpLmF0dHIoJ2lkJywgJ3ktYXhpcycpLmNhbGwoeUF4aXMpLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoICcgKyBbMCwgaGVpZ2h0ICogMl0gKyAnKScpLnRyYW5zaXRpb24oKS5kdXJhdGlvbigxMDAwKS5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCAnICsgWzMwLCBoZWlnaHQgLSBtYXhCYXJIZWlnaHQgLSAyMF0gKyAnKScpO1xuXHQvL3N2Zy5zZWxlY3QoJ2cnKS5jYWxsKHhBeGlzKS5hdHRyKCd3aWR0aCcsIDApLnRyYW5zaXRpb24oKS5kdXJhdGlvbigxMDAwKS5hdHRyKCd3aWR0aCcsIHdpZHRoKTtcblxufVxuXG5mdW5jdGlvbiBDb252ZXJ0RGJPdXRwdXRJbnRvTGVnYWN5RXhwZXJ0dXNGb3JtYXQoZGF0YSwgbWFpbk5hbWUpIHsgLy9bIHthdXRob3JzOiBbYXV0aG9yMSwgYXV0aG9yMl19IF1cblx0dmFyIExlZ2FjeUNvbGxhYm9yYXRvckxpc3QgPSBbXTtcblxuXHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKHdvcmspIHtcblx0XHR2YXIgc2luZ2xlV29ya0F1dGhvcnMgPSBbXTtcblx0XHR3b3JrLmF1dGhvcnMuZm9yRWFjaChmdW5jdGlvbiAoYXV0aG9yKSB7XG5cdFx0XHRpZiAoYXV0aG9yICE9IG1haW5OYW1lKSBzaW5nbGVXb3JrQXV0aG9ycy5wdXNoKGF1dGhvcik7XG5cdFx0fSk7XG5cdFx0TGVnYWN5Q29sbGFib3JhdG9yTGlzdC5wdXNoKHNpbmdsZVdvcmtBdXRob3JzKVxuXHR9KTtcblxuXHRyZXR1cm4gTGVnYWN5Q29sbGFib3JhdG9yTGlzdFxufVxuXG5mdW5jdGlvbiBnZXRCYXJzKGFsbFdvcmtzKSB7XG5cdGFsbFdvcmtzID0gYWxsV29ya3MubWFwKGZ1bmN0aW9uIChlbCkge1xuXHRcdGlmIChOdW1iZXIucGFyc2VJbnQoZWwueWVhcikgPCAxOTAwKSB7XG5cdFx0XHRlbC55ZWFyID0gTnVtYmVyLnBhcnNlSW50KGVsLnllYXIpIC0gKC0xMDAwKTtcblx0XHR9XG5cdFx0ZWxzZSBlbC55ZWFyID0gTnVtYmVyLnBhcnNlSW50KGVsLnllYXIpO1xuXHRcdHJldHVybiBlbDtcblx0fSk7XG5cblx0YWxsV29ya3Muc29ydChkeW5hbWljU29ydCgneWVhcicpKTtcblxuXG5cdHZhciBiYXJzID0gW107XG5cdFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IChhbGxXb3Jrc1thbGxXb3Jrcy5sZW5ndGggLSAxXS55ZWFyIC0gYWxsV29ya3NbMF0ueWVhciAtICgtMSkpOyBpKyspIHtcblx0XHRiYXJzLnB1c2goY291bnRZZWFyT2NjdXJlbmNlcyhhbGxXb3Jrc1swXS55ZWFyIC0gKC1pKSwgYWxsV29ya3MpKVxuXHR9XG5cblx0cmV0dXJuIGJhcnM7XG59XG5cbmZ1bmN0aW9uIGNvdW50WWVhck9jY3VyZW5jZXMoeWVhciwgYXJyKSB7XG5cdHZhciByZXNPYmogPSB7XG5cdFx0d29ya3M6IDAsXG5cdFx0YXJ0aWNsZXM6IDAsXG5cdFx0Ym9va3M6IDAsXG5cdFx0ZWRpdHM6IDAsXG5cdFx0eWVhcjogeWVhcixcblx0XHR0aXRsZXM6IFtdXG5cdH07XG5cdGFyci5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuXHRcdGlmIChlbC55ZWFyID09PSB5ZWFyKSB7XG5cdFx0XHRyZXNPYmoud29ya3MrKztcblx0XHRcdGlmKGVsLnB1YmxpY2F0aW9uVHlwZSA9PT0gJ2Jvb2snKSByZXNPYmouYm9va3MrKztcblx0XHRcdGlmKGVsLnB1YmxpY2F0aW9uVHlwZSA9PT0gJ2VkaXQnKSB7XG5cdFx0XHRcdHJlc09iai5lZGl0cysrO1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZygnUHVzaGluZyAnICsgZWwudGl0bGUpXG5cdFx0XHRcdHJlc09iai50aXRsZXMucHVzaChlbC50aXRsZSk7XG5cdFx0XHR9XG5cdFx0XHRpZihlbC5wdWJsaWNhdGlvblR5cGUgPT09ICdhcnRpY2xlJykgcmVzT2JqLmFydGljbGVzKys7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHJlc09iajtcbn1cblxuZnVuY3Rpb24gaW5jcmVtZW50Q29sbGFib3JhdGlvbihhcnIsIG5hbWUpIHtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoYXJyW2ldLm5hbWUgPT09IG5hbWUpIHtcblx0XHRcdGFycltpXS53b3JrcysrO1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRlQ29sbGFib3JhdG9yTGlzdChhbGxXb3Jrcykge1xuXG5cdHZhciBhbGxDb2xsYWJvcmF0b3JzID0gW107XG5cdHZhciBhbGxDb2xsYWJvcmF0b3JzV2l0aEFtb3VudHMgPSBbXTtcblx0dmFyIGNvbGxhYm9yYXRpb25BbW91bnRBcnJheSA9IFtdO1xuXHRhbGxXb3Jrcy5mb3JFYWNoKGZ1bmN0aW9uICh3b3JrKSB7XG5cdFx0d29yay5mb3JFYWNoKGZ1bmN0aW9uIChwZXJzb24pIHtcblx0XHRcdGlmICghYWxsQ29sbGFib3JhdG9ycy5pbmNsdWRlcyhwZXJzb24pKSB7XG5cdFx0XHRcdGFsbENvbGxhYm9yYXRvcnMucHVzaChwZXJzb24pO1xuXHRcdFx0XHRjb2xsYWJvcmF0aW9uQW1vdW50QXJyYXkucHVzaChcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRuYW1lOiBwZXJzb24sXG5cdFx0XHRcdFx0XHRhbW91bnQ6IDBcblx0XHRcdFx0XHR9KVxuXHRcdFx0fVxuXG5cdFx0fSlcblx0fSk7XG5cblx0YWxsQ29sbGFib3JhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChwZXJzb24pIHtcblx0XHRhbGxDb2xsYWJvcmF0b3JzV2l0aEFtb3VudHMucHVzaChcblx0XHRcdHtcblx0XHRcdFx0bmFtZTogcGVyc29uLFxuXHRcdFx0XHRjb2xsYWJvcmF0aW9uczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb2xsYWJvcmF0aW9uQW1vdW50QXJyYXkpKVxuXHRcdFx0fSlcblx0fSk7XG5cblxuXHRhbGxDb2xsYWJvcmF0b3JzV2l0aEFtb3VudHMuZm9yRWFjaChmdW5jdGlvbiAoY29sbGFib3JhdG9yLCBpbmRleCwgYXJyKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbGxXb3Jrcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGFsbFdvcmtzW2ldLmluY2x1ZGVzKGNvbGxhYm9yYXRvci5uYW1lKSkge1xuXHRcdFx0XHRhbGxXb3Jrc1tpXS5mb3JFYWNoKGZ1bmN0aW9uIChwZXJzb24pIHtcblx0XHRcdFx0XHRpbmNyZW1lbnRDb2xsYWJvcmF0aW9uKGNvbGxhYm9yYXRvci5jb2xsYWJvcmF0aW9ucywgcGVyc29uKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gYWxsQ29sbGFib3JhdG9yc1dpdGhBbW91bnRzO1xufVxuXG5mdW5jdGlvbiBjb21wYXJlQ29sbGFib3JhdG9yc0J5QW1vdW50KGEsIGIpIHtcblx0aWYgKGEuYW1vdW50IDwgYi5hbW91bnQpIHtcblx0XHRyZXR1cm4gLTE7XG5cdH1cblx0aWYgKGEuYW1vdW50ID4gYi5hbW91bnQpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXHRyZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gY2xlYXJTdmcoKSB7XG5cdGQzLnNlbGVjdCgnc3ZnJykuc2VsZWN0QWxsKCcqJykucmVtb3ZlKCk7XG59XG5mdW5jdGlvbiBEZWNsaW5hdGVQb2xpc2hXb3JkUHJhY2Eod29yZCwgbnVtYmVyKSB7XG5cdHN3aXRjaCAod29yZCkge1xuXHRcdGNhc2UgJ3ByYWNhJzpcblx0XHRcdGlmIChudW1iZXIgPT09IDEpIHJldHVybiBudW1iZXIgKyAnIHByYWNhJ1xuXHRcdFx0aWYgKG51bWJlciA+PSAyICYmIG51bWJlciA8PSA0KSByZXR1cm4gbnVtYmVyICsgJyBwcmFjZSdcblx0XHRcdHJldHVybiBudW1iZXIgKyAnIHByYWMnXG5cdFx0Y2FzZSAncmVkYWdvd2FuYSc6XG5cdFx0XHRpZiAobnVtYmVyID09PSAxKSByZXR1cm4gJyByZWRhZ293YW5hJ1xuXHRcdFx0aWYgKG51bWJlciA+PSAyICYmIG51bWJlciA8PSA0KSByZXR1cm4gJyByZWRhZ293YW5lJ1xuXHRcdFx0cmV0dXJuICcgcmVkYWdvd2FueWNoJztcblx0fVxuXG59XG5cbmZ1bmN0aW9uIGR5bmFtaWNTb3J0KHByb3BlcnR5KSB7XG5cdHZhciBzb3J0T3JkZXIgPSAxO1xuXHRpZiAocHJvcGVydHlbMF0gPT09IFwiLVwiKSB7XG5cdFx0c29ydE9yZGVyID0gLTE7XG5cdFx0cHJvcGVydHkgPSBwcm9wZXJ0eS5zdWJzdHIoMSk7XG5cdH1cblx0cmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG5cdFx0dmFyIHJlc3VsdCA9IChhW3Byb3BlcnR5XSA8IGJbcHJvcGVydHldKSA/IC0xIDogKGFbcHJvcGVydHldID4gYltwcm9wZXJ0eV0pID8gMSA6IDA7XG5cdFx0cmV0dXJuIHJlc3VsdCAqIHNvcnRPcmRlcjtcblx0fVxufVxuZnVuY3Rpb24gZGlzcGxheVdvcmtTdGF0c1dvcmtzSW5UaW1lKGRhdGEpIHtcblxuXHR2YXIgZGlzcGxheVZhbHVlcyA9IHtcblx0XHRtZWFuUGVyWWVhcjogMCxcblx0XHRzdW1PZldvcmtzOiAwLFxuXHRcdHN1bU9mQXJ0aWNsZXM6IDBcblx0fTtcblxuXHRkYXRhLmZvckVhY2goZnVuY3Rpb24gKHllYXIsIGluZGV4KSB7XG5cdFx0ZGlzcGxheVZhbHVlcy5zdW1PZldvcmtzICs9IE51bWJlci5wYXJzZUludCh5ZWFyLndvcmtzKTtcblx0XHRkaXNwbGF5VmFsdWVzLnN1bU9mQXJ0aWNsZXMgKz0gTnVtYmVyLnBhcnNlSW50KHllYXIuYXJ0aWNsZXMpO1xuXHR9KTtcblx0ZGlzcGxheVZhbHVlcy5tZWFuUGVyWWVhciA9IGRpc3BsYXlWYWx1ZXMuc3VtT2ZXb3JrcyAvIGRhdGEubGVuZ3RoO1xuXG5cblx0JCgnI21lYW4td29ya3MtYW1vdW50LWRpc3BsYXknKS50ZXh0KGRpc3BsYXlWYWx1ZXMubWVhblBlclllYXIudG9GaXhlZCgyKSk7XG5cdCQoJyNwdWJsaWNhdGlvbnMtYW1vdW50LWRpc3BsYXknKS50ZXh0KGRpc3BsYXlWYWx1ZXMuc3VtT2ZBcnRpY2xlcyk7XG5cdCQoJyN3b3Jrcy1hbW91bnQtZGlzcGxheScpLnRleHQoZGlzcGxheVZhbHVlcy5zdW1PZldvcmtzKTtcbn1cblxuLypcbmZ1bmN0aW9uIGdlblBkZkRvYygpIHtcblx0dmFyICRzdmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3ZnLXBvcnQnKVxuXHRcdCwgZG9jID0gbmV3IFBERkRvY3VtZW50KHtcblx0XHRsYXlvdXQ6ICdsYW5kc2NhcGUnXG5cdH0pXG5cdFx0LCBzdHJlYW0gPSBkb2MucGlwZShibG9iU3RyZWFtKCkpO1xuXHRkb2MuZm9udFNpemUoMjUpXG5cdFx0LnRleHQoJ0xpY3piYSBwdWJsaWthY2ppIHcgY3phc2llJywgMTAwLCA0MCk7XG5cdGRvYy5mb250U2l6ZSgxMilcblx0XHQudGV4dCgnV3lnZW5lcm93YW5vIHByemV6ICcsIHtcblx0XHRcdGNvbnRpbnVlZDogdHJ1ZVxuXHRcdH0pXG5cdFx0LnRleHQoJ1dpenVhbGl6YXRvciBEb3JvYmt1IE5hdWtvd2VnbycsIHtcblx0XHRcdGNvbnRpbnVlZDogdHJ1ZSxcblx0XHRcdGxpbms6ICdodHRwOi8vdmlzdWFsaXplbWUudW1rLnBsJ1xuXHRcdH0pXG5cdFx0LnRleHQoJyBkbGEgJyArIGF1dGhvck5hbWUubm9ybWFsaXplKCdORkQnKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCBcIlwiKSk7XG5cblxuXHR2YXIgc2NhbGUgPSBkb2MucGFnZS53aWR0aCAvICRzdmcud2lkdGguYmFzZVZhbC52YWx1ZTtcblx0dmFyIHdpZHRoID0gJHN2Zy53aWR0aC5iYXNlVmFsLnZhbHVlO1xuXHR2YXIgaGVpZ2h0ID0gJHN2Zy5oZWlnaHQuYmFzZVZhbC52YWx1ZTtcblx0Y29uc29sZS5sb2coc2NhbGUpO1xuLy8gICAgICAgICRzdmcgPSAkc3ZnLmNsb25lTm9kZSh0cnVlKTtcblx0JHN2Zy5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgc2NhbGUgKyAnKScpO1xuXG5cdFNWR3RvUERGKGRvYywgJHN2ZywgMTAwLCAwLCB7d2lkdGg6IHdpZHRoLCBoZWlnaHQ6IGhlaWdodH0pO1xuXG5cblxuXG5cblx0c3RyZWFtLm9uKCdmaW5pc2gnLCBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZyhzdHJlYW0udG9CbG9iVVJMKCdhcHBsaWNhdGlvbi9wZGYnKSk7XG5cdFx0d2luZG93LmxvY2F0aW9uID0gc3RyZWFtLnRvQmxvYlVSTCgnYXBwbGljYXRpb24vcGRmJyk7XG5cdH0pO1xuXHRkb2MuZW5kKCk7XG5cbn0qL1xuIl0sInNvdXJjZVJvb3QiOiIifQ==