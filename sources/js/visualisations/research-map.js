
$(document).ready(function () {
	$.post("research-mapData", {}, function (data) {


		domainsList = GetDomainList();

		console.log(data)
		articles = AssignWorksToDomains(data, domainsList);



		DrawDomains(articles, GetDomainAngleBounds(domainsList))
	})
});

function GetDomainList () {
	return Object.keys(DOMAINS).map(function(key) {
		return {
			weight: DOMAINS[key].weight,
			topic: key,
			hue: DOMAINS[key].hue
		}
	});
}

/**
	* @returns {Array} of article-type work objects with domain array added as property
**/
function AssignWorksToDomains(works, domainsList) {
	return works
		.filter(function(w) {
			return w.publicationType === 'article' &&
			w.journalTitle !== undefined &&
			JOURNALS[w.journalTitle] !== undefined
		})
		.map(function (w) {
			if(JOURNALS[w.journalTitle] === undefined) {
				console.log(w.journalTitle)
			}
			w.domains = JOURNALS[w.journalTitle].domains;
			w.domains[0].hue = DOMAINS[w.domains[0].name].hue
			return w;
		});
}

/**
  * @returns {Array} of objects describing circle sections by the position of their beggining and ending in radians 
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

/**
 * @param radius {Number} Radius for cartesian conversion
 * @param anglePositions {Array} [ [domain starting angle, domain ending angle], ...]
 */
function GetCartesianDomainCentres(anglePositions, radius) {
	var centres = anglePositions.map(function (pos) {
		return {
			centre: pos.angleBounds.begin + ((pos.angleBounds.end - pos.angleBounds.begin) / 2) - Math.PI / 2,
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
		bounds.slotAmount = 0
		bounds.slotPositions = []


		for(var j = 0; j < 5; j++) {
			var currentSlotRingRadius = slotRingRadius - j*slotRingRadiiDist
			var angularNodeRadius = CartesianLengthToPolar(nodeRadius, currentSlotRingRadius)
			var angularNodePadding = CartesianLengthToPolar(nodePadding, currentSlotRingRadius)
			var currentSlotAmount = Math.floor(currentSlotRingRadius * (bounds.angleBounds.end - bounds.angleBounds.begin) / (2*nodeRadius + nodePadding))
			bounds.slotAmount += currentSlotAmount
			for (var i = 0; i < currentSlotAmount; i++) {
				bounds.slotPositions.push(PolarToCartesian(bounds.angleBounds.begin + (i*(angularNodePadding + 2*angularNodeRadius)) + angularNodeRadius - Math.PI / 2, currentSlotRingRadius))
			};
		}
		


		return bounds
	})
}

function DrawDomains(articles, angleBounds) {
	var svg = d3.select("#svg-port"),
		jQPort = $(".svg-port"),
		width = jQPort.width(),
		height = jQPort.height();
	var radius = height / 3;
	var nodeRadius = 8
	var nodePadding = 20
	var ringWidth = 30;
	var centre =
		{
			x: width / 2,
			y: height / 2
		};
	var padAngle = toRad(5);
	/*
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
	}*/
	console.log("Angle Bounds")
	console.log(angleBounds)
	var domainCoordinates = GetCartesianDomainCentres(angleBounds, radius);
	// var domainLabelCoordinates = GetCartesianDomainCentres(angleBounds, radius * 1.5)
	var publicationNodeSlotCoordinates = GetCartesianNodeSlots(angleBounds, radius * 0.8, radius * 0.1, 8, 3)
	console.log(publicationNodeSlotCoordinates)
	var topicToSlotCoordArrayMap = {};
	publicationNodeSlotCoordinates.forEach(function(domain) {
		topicToSlotCoordArrayMap[domain.topic] = domain
		topicToSlotCoordArrayMap[domain.topic].counter = 0
	})
	articles.forEach(function(article) { //TODO: multiple domains
		// if(article.domains.length === 1)
			article.coords = topicToSlotCoordArrayMap[article.domains[0].name].slotPositions[topicToSlotCoordArrayMap[article.domains[0].name].counter++]
		// else {
		// 	var c1 = domainCoordinates[article.domains[0].name];
		// 	var c2 = domainCoordinates[article.domains[1].name];
		// 	article.coords = {x: (c1.x+c2.x)/2, y:(c1.y+c2.y)/2}
		// }
		if(!article.coords) article.coords = {x: 0, y: 0}
	})
	console.log(articles)

	var nodeTip = d3.tip().attr('class', 'd3-tip').html(function(d) {
		return d.tip || d.topic;
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

	angleBounds.forEach(function (angles) {
		arcsGroup.append('path')
			.attr('d', domainArcs(angles))
			.attr('id', angles.topic)
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

	console.log(topicToSlotCoordArrayMap)



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
		.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
		// .on('mouseover', nodeTip.show)
		// .on('mouseout', nodeTip.hide)
/* Draw node slots for debugging
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
