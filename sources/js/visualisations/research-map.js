$(document).ready(function () {
	$.post("research-mapData", {}, function (data) {
		DrawDomains(data.length)
	})
});



function DivideDomains(domainsList) {
	var sumOfWeights = 0;
	domainsList.forEach(function (el) {
		sumOfWeights += el.weight;
	});
	console.log('sum of weights ' + sumOfWeights);
	var angleCounter = 0;
	return domainsList.map(function (weightedDomain) {
		var current = {
			begin: angleCounter,
			end: angleCounter + ( weightedDomain.weight / sumOfWeights ) * 2 * Math.PI
		};
		angleCounter += ( ( weightedDomain.weight / sumOfWeights ) * 2 * Math.PI );
		return {
			angleBounds: current,
			topic: weightedDomain.topic,
			hue: weightedDomain.hue

		};
	})
}

/**
 * @param radius {Number} Radius for cartesian conversion
 * @param anglePositions {Array} [ [domain starting angle, domain ending angle], ...]
 */
function GetCartesianDomainCentres(anglePositions, radius) {
	var centres = anglePositions.map(function (pos) {
		return {
			centre: pos.angleBounds.begin + ((pos.angleBounds.end - pos.angleBounds.begin) / 2) - toRad(90),
			topic: pos.topic
		};
	});
	var DomainToCentreCoordinatesMap = {};
	centres.forEach(function (centre) {
		DomainToCentreCoordinatesMap[centre.topic] = PolarToCartesian(centre.centre, radius * 3 / 4);
	});
	return DomainToCentreCoordinatesMap;
}

function DrawDomains(amountOfNodes) {
	var svg = d3.select("#svg-port"),
		jQPort = $(".svg-port"),
		width = jQPort.width(),
		height = jQPort.height();
	var radius = height / 3;
	var ringWidth = 40;
	var centre =
		{
			x: width / 2,
			y: height / 2
		};
	var padAngle = toRad(5);


	var moreExampleDomains = [
		{
			topic: "n. przyrodnicze",
			weight: 7836,
			hue: "#ff9100"
		},
		{
			topic: "nauki o życiu",
			weight: 13082,
			hue: "#ffb400"
		},
		{
			topic: "lekarski, farmaceutyczny",
			weight: 13967,
			hue: "#a9a9a9"
		},
		{
			topic: "informatyka (z matematyką)",
			weight: 1752,
			hue: "#828282"
		},
		{
			topic: "n. humanistyczne",
			weight: 18907,
			hue: "#2d81a7"
		},
		{
			topic: "n. społeczne",
			weight: 8674,
			hue: "#005a84"
		}
	];

	var exampleDomains = [
		{
			topic: "n. przyrodnicze",
			weight: 7836,
			hue: "#5224cb"
		},
		{
			topic: "nauki o życiu",
			weight: 13082,
			hue: "#e31a12"
		},
		{
			topic: "lekarski, farmaceutyczny",
			weight: 13967,
			hue: "#ff739e"
		},
		{
			topic: "informatyka (z matematyką)",
			weight: 1752,
			hue: "#f66cfd"
		},
		{
			topic: "n. humanistyczne",
			weight: 18907,
			hue: "#fcea75"
		},
		{
			topic: "n. społeczne",
			weight: 8674,
			hue: "#fcb47a"
		}
	];
	var Publications = [];
	for(var i=0; i<amountOfNodes; i++) {
		var weight1 = Math.random(),
			weight2 = 1 - weight1,
			topic1 = Math.floor(Math.random() * 6),
			topic2 = topic1;

		while(topic2 === topic1) topic2 = Math.floor(Math.random() * 6);
		var pub = {
			topics: [{
				topic: exampleDomains[topic1].topic.toString(),
				weight: weight1
			},{
				topic: exampleDomains[topic2].topic.toString(),
				weight: weight2
			}],
			title: i,
			anchor: false
		}
		Publications.push(pub)
	}

	var angleBounds = DivideDomains(exampleDomains);

	var domainCoordinates = GetCartesianDomainCentres(angleBounds, radius);
	var domainLabelCoordinates = GetCartesianDomainCentres(angleBounds, radius * 1.5)

	angleBounds.forEach(function(domain){
		Publications.push({
			anchor: true,
			fx: domainCoordinates[domain.topic].x,
			fy: domainCoordinates[domain.topic].y,
			title: domain.topic
		})
	});

	var linksToDomains = [];
	Publications.forEach(function (publication) {
		if(!publication.anchor) publication.topics.forEach(function (topic) {
			linksToDomains.push({
				source: publication.title,
				target: topic.topic,
				weight: topic.weight
			})
		})
	});

	var domainArcs = d3
		.arc()
		.innerRadius(radius - ringWidth)
		.outerRadius(radius)
		.startAngle(function (d) {
			return d.angleBounds.begin + padAngle/2;
		})
		.endAngle(function (d) {
			return d.angleBounds.end - padAngle/2;
		});

	var arcsGroup = svg
		.append('g')
		.attr('id', 'arcs-g');

	angleBounds.forEach(function (angles) {
		arcsGroup.append('path')
			.attr('d', domainArcs(angles))
			.attr('id', angles.topic)
			.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
			.attr('fill', function () {
				return angles.hue
			});

		svg.append('g').attr('transform','translate(' + [width/2, height/2] + ')')
			.append("text")
			.attr('text-anchor', 'middle')
			.attr('transform', 'translate(' + [domainLabelCoordinates[angles.topic].x, domainLabelCoordinates[angles.topic].y] + ')')
			.text(angles.topic);
	});




	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink()
			.id(function (d) {
				return d.title
			})
			.distance(function (d) {
				return (radius / 8) / d.weight
			})
			.strength(function (d) {
				return d.weight
			}))
		.alphaDecay(0.015)
		.velocityDecay(0.1)


	simulation
		.nodes(Publications)
		.on('tick', updateOnTick);


	simulation.force("link")
		.links(linksToDomains);

	var nodeTip = d3.tip().attr('class', 'd3-tip').html(function(d) {
		var string = '';
		d.topics.forEach(function (topic, index) {
			if(index != 0) string += '<br>';
			string += topic.topic + ' : ' + Math.round(topic.weight*100)/100;
		});
		return string;
	});
	svg.call(nodeTip);

	var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(Publications)
		.enter().append("circle")
		.attr("r", function (d) {
			return 5
		})
		.attr("fill", "#898989")
		.attr("stroke", "#434343")
		.attr("stroke-width", "1px")
		.attr('cx', function (d) {
			return d.x
		})
		.attr('cy', function (d) {
			return d.y
		})
		.style('visibility', function (d) {
			if(d.anchor) return 'hidden';
			return 'visible';
		})
		.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended))
		.on('mouseover', nodeTip.show)
		.on('mouseout', nodeTip.hide)

	function dragstarted(d) {
		if(d.anchor) return;
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		if(d.anchor) return;
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if(d.anchor) return;
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	function updateOnTick() {
		node
			.attr("cx", function (d) {
				return d.x;
			})
			.attr("cy", function (d) {
				return d.y;
			});
	}

}


var colorCounter = 0;
function NextColor() {
	if (colorCounter >= 9) colorCounter = 0;
	return d3.schemeSet2[colorCounter++];
}

function displayWorkStatsCollab (data) {

	var displayValues = {
		coworkersAmount: data.simNodes.length - 1,
		mostSharedWorks: 1,
		sumOfWorks: 0
	};

	data.simNodes.forEach(function (coauthor, index) {
		if(coauthor.strengthValue > displayValues.mostSharedWorks && index != 0) {
			displayValues.mostSharedWorks = coauthor.strengthValue;
			displayValues.mostSharedWorksWith = coauthor.id;
		}
		displayValues.sumOfWorks += coauthor.strengthValue
	});
	displayValues.meanAmountOfWorks = displayValues.sumOfWorks / data.simNodes.length;


	$('#coworkers-amount-display').text(displayValues.coworkersAmount);
	$('#max-shared-works-amount-display').text(displayValues.mostSharedWorksWith + ' (' + displayValues.mostSharedWorks + ') ');
	$('#mean-coworkers-amount-display').text(displayValues.meanAmountOfWorks.toFixed(2));
	$('#works-amount-display').text(displayValues.sumOfWorks)
}

function ConvertDbOutputIntoLegacyExpertusFormat(data, mainName) { //[ {authors: [author1, author2]} ]
	var LegacyCollaboratorList = [];

	data.forEach(function (work) {
		var singleWorkAuthors = [];
		work.authors.forEach(function (author) {
			if(author != mainName) singleWorkAuthors.push(author);
		});
		LegacyCollaboratorList.push(singleWorkAuthors)
	});

	return LegacyCollaboratorList
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


function PolarToCartesian(angle, length) {
	return {
		x: Math.cos(angle) * length,
		y: Math.sin(angle) * length
	}
}
function toRad(deg) {
	return deg*Math.PI/180;
}
function getPositions (previousPositions, currentAmount) {
	var range = 360 / currentAmount;
	// if(range == 360) range = 180;
	var currentPositions = [];
	for(var angle = 0; angle < 360; angle += range) {
		currentPositions.push(angle);
	}

	var positionDifferences = [];
	var minimalPositionDifference = 0, currentBestOffset = 0;
	for(var offset=0; offset<range; offset += (range/20) ) {

		positionDifferences = currentPositions.map(function (position) {
			var distancesFromSinglePoint = [];
			previousPositions.forEach(function (previousPosition) {
				distancesFromSinglePoint.push(Math.abs(previousPosition - position - offset) % 180);
			});
			return Math.min.apply(null, distancesFromSinglePoint);
		});

		if(Math.min.apply(null, positionDifferences) > minimalPositionDifference) {
			minimalPositionDifference = Math.min.apply(null, positionDifferences);
			currentBestOffset = offset
		}

	}

	return currentPositions.map(function (position) {
		return position + currentBestOffset;
	})
}

function getRingValues(singleCollaborationList) {

	singleCollaborationList = singleCollaborationList.sort(compareCollaboratorsByAmount);

	var ringValues = [{
		worksAmount: 1,
		people: []
	}];
	for(var i = 1; i<singleCollaborationList.length; i++) {
		if(singleCollaborationList[i-1].amount != singleCollaborationList[i].amount) {
			ringValues.push( {
				worksAmount: singleCollaborationList[i].amount,
				people: [singleCollaborationList[i].name]
			} )
		}
		else {
			ringValues[ ringValues.length - 1 ].people.push(singleCollaborationList[i].name);
		}
	}
	return ringValues;
}

function incrementCollaboration (arr, name) {
	for(var i=0; i<arr.length; i++) {
		if(arr[i].name == name) {
			arr[i].amount++;
			return
		}
	}
}

function getCompleteCollaboratorList ( allWorks ) {

	var allCollaborators = [];
	var allCollaboratorsWithAmounts = [];
	var collaborationAmountArray = [];
	allWorks.forEach(function (work) {
		work.forEach(function (person) {
			if(!allCollaborators.includes(person)) {
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
		for(var i=0; i<allWorks.length; i++) {
			if(allWorks[i].includes(collaborator.name)) {
				allWorks[i].forEach(function (person) {
					incrementCollaboration(collaborator.collaborations, person);
				});
			}
		}
	});

	return allCollaboratorsWithAmounts;
}

function compareCollaboratorsByAmount (a, b) {
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

function ParseExpertusCollaborationList(rawText) { //an array of arrays containing author names
	rawText = rawText.trim();
	var lines = rawText.split('\n');
	var works = [];
	for(var i=0; i<lines.length; i++) {
		var people = [];
		while(isPerson(lines[i]) != false && i < lines.length) {
			people.push(isPerson(lines[i]));
			i++
		}
		if(people.length > 0) works.push(people);
	}

	return(works);
}

function PolskaFleksjaSlowaPraca(word, number) {
	if(number == 1) return number + ' praca'
	if(number >=2 && number <=4) return number + ' prace'
	return number + ' prac'
}

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

}
