var methodToggle = true;
function methodToggleButton () {
	methodToggle = !methodToggle;
	d3.select('svg').selectAll('*').remove();
	$.post("research-mapData", {}, function (data) {



		var articles = AssignWorksToDomains(data, DOMAINS);

		DrawDomains(articles, GetDomainAngleBounds(DOMAINS))
	})}

$(document).ready(function () {
	$('#genPdfBtn').parent().append("<button class='btn' onclick='methodToggleButton()'>Metoda uśredniania</button>")

	$.post("research-mapData", {}, function (data) {


		var articles = AssignWorksToDomains(data, DOMAINS);

		DrawDomains(articles, GetDomainAngleBounds(DOMAINS))
	})
});

/**
	* @returns {Array} of article-type work objects with domain array added as property
**/
function AssignWorksToDomains(works, domainsList) {
	var worksByJournal = {};
	works
		.filter(function(w) {
			return w.publicationType === 'article' &&
			w.journalTitle !== undefined &&
			JOURNALS[w.journalTitle] !== undefined
		})
		.forEach(function (w) {
			if(JOURNALS[w.journalTitle] === undefined) {
				console.log(w.journalTitle)
			}

			if(worksByJournal[w.journalTitle]){
				worksByJournal[w.journalTitle].amount++
			}
			else {


				w.domains = JOURNALS[w.journalTitle].domains;
				w.discipline = JOURNALS[w.journalTitle].disciplines[0].name;

				DOMAINS.forEach(function (domain) {
					if(domain.topic === w.domains[0].name)
						w.domains[0].hue = domain.hue
				})
				w.amount = 1;
				w.index = 0;
				worksByJournal[w.journalTitle] = w;
			}
		});

	return Object.keys(worksByJournal).map(function (title) {
		return worksByJournal[title]
	})
}

/**
  * @returns {Array} of objects describing circle sections by the position of their beginning and ending in radians
**/
function GetDomainAngleBounds(domainsList) {
	var angleCounter = 0;

	return domainsList.map(function (domain) {
		var current = {
			begin: angleCounter,
			end: angleCounter + ( domain.weight * 2 * Math.PI )
		};
		angleCounter += ( domain.weight * 2 * Math.PI );
		return {
			angleBounds: current,
			topic: domain.topic,
			hue: domain.hue

		};
	});
}

function GetDisciplineAngleBounds(angleBounds, works) {
	domainToDiscliplinesMap = {}
	disciplines = []
	works.forEach(function (work) {
		if(!domainToDiscliplinesMap[work.domains[0].name])
			domainToDiscliplinesMap[work.domains[0].name] = [work.discipline]

		else
			if(!(0 <= domainToDiscliplinesMap[work.domains[0].name].indexOf(work.discipline)))
				domainToDiscliplinesMap[work.domains[0].name].push(work.discipline)
	})
	// console.log(domainToDiscliplinesMap)



	angleBounds.filter(function (domain) {
		return !!domainToDiscliplinesMap[domain.topic] // filter out domains where no article was published
	}).forEach(function (domain) {
		// console.log(domain)
		var begin = domain.angleBounds.begin, span = domain.angleBounds.end - domain.angleBounds.begin
		var unit = span / domainToDiscliplinesMap[domain.topic].length;

		for(var i = 0; i < domainToDiscliplinesMap[domain.topic].length; i++) {
			disciplines.push({
				discipline: domainToDiscliplinesMap[domain.topic][i],
				angleBounds: {
					begin: begin + unit * i,
					end: begin + unit * (i + 1)
				},
				domain: domain
			})
		}

	});

	return disciplines;
}

/**
 * @param radius {Number} Radius for cartesian conversion
 * @param anglePositions {Array} [ [domain starting angle, domain ending angle], ...]
 */
function GetCartesianDomainCentres(anglePositions, radius) {
	var centres = anglePositions.map(function (pos) {
		return {
			centre: (pos.angleBounds.begin + pos.angleBounds.end) / 2 - Math.PI / 4,
			topic: pos.topic
		};
	});
	var DomainToCentreCoordinatesMap = {};
	centres.forEach(function (centre) {
		DomainToCentreCoordinatesMap[centre.topic] = PolarToCartesian(centre.centre, radius * 3 / 4);
	});
	return DomainToCentreCoordinatesMap;
}

function GetCartesianNodeSlots(angleBounds, slotRingRadius, slotRingRadiiDist, nodeRadius, nodePadding) {
	return angleBounds.map(function(bounds) {
		bounds.slotAmount = 0;
		bounds.slotPositions = [];


		for(var j = 0; j < 5; j++) {
			var currentSlotRingRadius = slotRingRadius - j*slotRingRadiiDist
			var angularNodeRadius = CartesianLengthToPolar(nodeRadius, currentSlotRingRadius)
			var angularNodePadding = CartesianLengthToPolar(nodePadding, currentSlotRingRadius)
			var currentSlotAmount = Math.floor(currentSlotRingRadius * (bounds.angleBounds.end - bounds.angleBounds.begin) / (2*nodeRadius + nodePadding))
			bounds.slotAmount += currentSlotAmount;
			for (var i = 0; i < currentSlotAmount; i++) {
				bounds.slotPositions.push(PolarToCartesian(bounds.angleBounds.begin + (i*(angularNodePadding + 2*angularNodeRadius)) + angularNodeRadius - Math.PI / 2, currentSlotRingRadius))
			};
		}
		


		return bounds
	})
}

function OffsetNodeCoords(coords, offset) {
	return PolarToCartesian(coords.angle, coords.r - offset)
}



function DrawDomains(articles, angleBounds) {
	var svg = d3.select("#svg-port"),
		jQPort = $(".svg-port"),
		width = jQPort.width(),
		height = jQPort.height();
	var radius = height / 2.3;
	var nodeRadius = 6
	var nodePadding = 3
	var ringWidth = 30;
	var stackingOffset = 5;
	var centre =
		{
			x: width / 2,
			y: height / 2
		};
	var padAngle = toRad(5);

	var subringRadius = 20;

	console.log("Angle Bounds")
	console.log(angleBounds)
	console.log("Articles")
	console.log(articles)

	var domainCoordinates = GetCartesianDomainCentres(angleBounds, radius);
	console.log("Domain coords")
	console.log(domainCoordinates)

	var disciplineAngleBounds = GetDisciplineAngleBounds(angleBounds, articles);


	console.log("Discipline Angle Bounds")
	console.log(disciplineAngleBounds)
	// var domainLabelCoordinates = GetCartesianDomainCentres(angleBounds, radius * 1.5)
	var publicationNodeSlotCoordinates = GetCartesianNodeSlots(disciplineAngleBounds, radius * 0.8, radius * 0.1, nodeRadius, nodePadding)
	console.log(publicationNodeSlotCoordinates)
	var disciplineToSlotCoordArrayMap = {};
	publicationNodeSlotCoordinates.forEach(function(domain) {
		disciplineToSlotCoordArrayMap[domain.discipline] = domain;
		disciplineToSlotCoordArrayMap[domain.discipline].counter = 0
	})

	articles = articles.sort(function compare(a, b) {
		if (a.amount < b.amount) {
			return -1;
		}
		if (a.amount < b.amount) {
			return 1;
		}
		return 0;
	});

	var crossings = {}
	articles.forEach(function (article) {
		if(article.domains.length === 2) {
			var crossing = null, swapDomains = article.domains[0].name < article.domains[1].name
			if(swapDomains)
				crossing = article.domains[0].name + article.domains[1].name;
			else crossing = article.domains[1].name + article.domains[0].name;

			if(!crossings[crossing]) {
				crossings[crossing] = {
					amount: 1,
					domain1: swapDomains ? article.domains[0].name : article.domains[1].name,
					domain2: swapDomains ? article.domains[1].name : article.domains[1].name
				}
			}
			else crossings[crossing].amount++;

			article.crossing = crossing;
		}
	});


	//method1
	var domainCrossingAngleBounds = [];
	for (var cros in crossings)
		if(crossings.hasOwnProperty(cros)) {
			var angle1 = domainCoordinates[crossings[cros].domain1].angle, angle2 = domainCoordinates[crossings[cros].domain2].angle
			if(angle1 > angle2) {
				var tmp = angle1;
				angle1 = angle2;
				angle2 = tmp;
			}
			var angularCentre = angle1 + (angle2 - angle1 / 2)
			var angularWidth = (crossings[cros].amount * (nodePadding*2 + nodeRadius)) / (radius / 2)
			crossings[cros].angleBounds = {
				begin: angularCentre - angularWidth / 2,
				end: angularCentre + angularWidth / 2
			}
			crossings[cros].crossing = cros;
			domainCrossingAngleBounds.push(crossings[cros])
		}
	var domainCrossingCartesianNodeSlots = GetCartesianNodeSlots(domainCrossingAngleBounds, radius / 2, 20, nodeRadius, nodePadding);
	var crossingToSlotCoordArrayMap = {};
	domainCrossingCartesianNodeSlots.forEach(function(cros) {
		crossingToSlotCoordArrayMap[cros.crossing] = cros;
		crossingToSlotCoordArrayMap[cros.crossing].counter = 0
	})
	console.log(crossingToSlotCoordArrayMap)


	var lenArticles = articles.length;
	var artIdx = 0;
	while(artIdx < lenArticles) {
		var article = articles[artIdx];
		if(article.index === 0) {
			if(article.domains.length === 1 || methodToggle) {
				article.coords = disciplineToSlotCoordArrayMap[article.discipline].slotPositions[disciplineToSlotCoordArrayMap[article.discipline].counter++]
				if (!disciplineToSlotCoordArrayMap[article.discipline].slotPositions[disciplineToSlotCoordArrayMap[article.discipline].counter]) {
					console.log('Exhausted discipline slots at ' + disciplineToSlotCoordArrayMap[article.discipline].counter)
				}
			}
			else {
				article.coords = crossingToSlotCoordArrayMap[article.crossing].slotPositions[crossingToSlotCoordArrayMap[article.crossing].counter++];
				if (!crossingToSlotCoordArrayMap[article.crossing].slotPositions[crossingToSlotCoordArrayMap[article.crossing].counter]) {
					console.log('Exhausted crossing slots at ' + crossingToSlotCoordArrayMap[article.crossing].counter)
				}
			}
		}
		if(!article.coords) {
			console.log('Exhausted slots')
			article.coords = {x: 0, y: 0, r:1, angle: 0}
		}

		var i = 1;
		while(article.amount > article.index + i) {
			var articleCopy = JSON.parse(JSON.stringify(article));
			articleCopy.index++;
			console.log(article)
			articleCopy.coords = OffsetNodeCoords(article.coords, stackingOffset * i);
			articles.push(articleCopy);
			i++
		}
		// else {
		// 	var c1 = domainCoordinates[article.domains[0].name];
		// 	var c2 = domainCoordinates[article.domains[1].name];
		// 	article.coords = {x: (c1.x+c2.x)/2, y:(c1.y+c2.y)/2}
		// }
		if(!article.coords) article.coords = {x: 0, y: 0}

		artIdx++
	}


	console.log(articles);

	var nodeTip = d3.tip().attr('class', 'd3-tip').html(function(d) {
		return d.tip || d.topic || d.discipline + " - " + d.domains.map(function(dom){return dom.name}).join("; ") + "<br>"  + PolskaFleksjaSlowaPraca("praca", d.amount) + " w " + d.journalTitle;
	});

	var domainArcs = d3
		.arc()
		.innerRadius(radius - ringWidth)
		.outerRadius(radius)
		.startAngle(function (d) {
			return d.angleBounds.begin //+ padAngle/2;
		})
		.endAngle(function (d) {
			return d.angleBounds.end //- padAngle/2;
		});

	var arcsGroup = svg
		.append('g')
		.attr('id', 'arcs-g');
	console.log(angleBounds)
	angleBounds.forEach(function (angles) {
		arcsGroup.append('path')
			.attr('d', domainArcs(angles))
			.attr('id', angles.topic)
			// .attr('transform', 'translate(' + 500 + ' , ' + 500 + ')')
			.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
			.attr('fill', function () {
				return angles.hue
			})
			.on('mouseover', function() {nodeTip.show(angles)})
			.on('mouseout', nodeTip.hide);

		// svg.append('g').attr('transform','translate(' + [width/2, height/2] + ')')
		// 	.append("text")
		// 	.attr('text-anchor', 'middle')
		// 	.attr('transform', 'translate(' + [domainLabelCoordinates[angles.topic].x, domainLabelCoordinates[angles.topic].y] + ')')
		// 	.text(angles.topic);
	});

	console.log(disciplineToSlotCoordArrayMap);



	svg.call(nodeTip);

	var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(articles)
		.enter().append("circle")
		.attr("r", function (d) {
			return nodeRadius
		})
		.attr("fill", function (d) {
			return d.domains[0].hue
		})
		.attr("stroke", "#434343")
		.attr("stroke-width", "1px")
		.attr('cx', function (d, i) {
			return d.coords.x
		})
		.attr('cy', function (d, i) {
			return d.coords.y
		})
		// .attr('transform', 'translate(' + 500 + ' , ' + 500 + ')')
		.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
		.on('mouseover', nodeTip.show)
		.on('mouseout', nodeTip.hide)


/*
//Draw node slots for debugging
	var nodeSlot = svg.append("g")
		.attr("class", "node-slots")
		.selectAll("circle.node-slots")
		.data(publicationNodeSlotCoordinates.reduce(function(acc, x) {
			
			return acc.concat(x.slotPositions.map(function(sP) {
				sP.hue = x.hue
				return sP
			}))
		}, []))
		.enter().append("circle")
		.attr("r", 2)
		.attr("cx", function(d) {return d.x})
		.attr("cy", function(d){return d.y})
		.attr("fill", function(d){return d.hue})
		.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
*/

}
