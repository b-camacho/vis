$(document).ready(function () {
	$.post("worksData", function (data) {
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
		return 'Rok ' + d.year + ': ' + PolskaFleksjaSlowaPraca('praca', d.works) + '.</br> W tym ' + d.books + ' monografii <br> oraz ' + PolskaFleksjaSlowaPraca('praca', d.edits) + PolskaFleksjaSlowaPraca('redagowana', d.edits) + '.';
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
	allWorks.forEach(function (el) {
		if (Number.parseInt(el.year) < 1900) el.year = Number.parseInt(el.year) - (-1000);
	});
	allWorks.sort(dynamicSort('year'));
	console.log('Sorted works');
	console.log(allWorks);

	var bars = [];
	for (var i = 0; i < (allWorks[allWorks.length - 1].year - allWorks[0].year - (-1)); i++) {
		bars.push(countYearOccurences(allWorks[0].year - (-i), allWorks))
	}
	console.log(bars);
	return bars;
}

function countYearOccurences(year, arr) {
	var resObj = {
		works: 0,
		articles: 0,
		books: 0,
		edits: 0,
		year: year
	};
	arr.forEach(function (el) {
		if (el.year === year) {
			resObj.works++;
			if(el.publicationType === 'book') resObj.books++;
			if(el.publicationType === 'edit') resObj.edits++;
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
function PolskaFleksjaSlowaPraca(word, number) {
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

	console.log(displayValues);

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
