import * as d3 from 'd3';
import {PolarToCartesian, CartesianLengthToPolar, addButton, getDimensions} from "../util";
import d3Tip from 'd3-tip';
import {DrawResearchMapKey, FetchRenderedPDF, InjectContext} from "../common";
import {Domains} from '../domains';
import {Journals} from '../journals'

var methodToggle = true, whiskerToggle = true, missingToggle = false;
var missingJournals = 0;
var missingJournalsMap = {};
var foundJournalsMap = {};
var justArticles = 0;
function methodToggleButton () {
	methodToggle = !methodToggle;
	d3.select('svg').selectAll('*').remove();
	InjectContext((works, strings) => {
		missingJournals = 0;
		justArticles = 0;
		var articles = AssignWorksToDomains(data);
		DrawDomains(articles, GetDomainAngleBounds(Domains), strings)
	})
}

function whiskerToggleButton() {
	whiskerToggle = !whiskerToggle;
	if (whiskerToggle) {
		$(".whiskers").show();
		$(".disciplineTitles").show();
	}
	else {
		$(".whiskers").hide();
		$(".disciplineTitles").hide();
	}
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}


function showMissingJournals() {
	missingToggle = !missingToggle;
	var missingJournalString = jsStrings.tsv_footer + '\r\n' + jsStrings.journal_name + '\t' + jsStrings.discipline + '\t' + jsStrings.domain1 + '\t' + jsStrings.domain2 + '\r\n';
	for (var title in foundJournalsMap)
		if(foundJournalsMap.hasOwnProperty(title)) {
			missingJournalString +=
				foundJournalsMap[title] + '\t' +
				Journals[title].disciplines[0].name + '\t' +
				Journals[title].domains[0].name + '\t' +
				(Journals[title].domains.length > 1 ? Journals[title].domains[1].name : '-') + '\r\n'
		}
	missingJournalString += jsStrings.missing_journal_name + '\r\n';
	for(var title in missingJournalsMap)
		if(missingJournalsMap.hasOwnProperty(title)) {
		missingJournalString +=  title + '\r\n'
		}
	if(missingToggle) {
		download('journals.tsv', missingJournalString)
	}

	else
		$('#missingTitles').remove();
}

document.addEventListener('DOMContentLoaded', () => InjectContext( (works, strings) => {
	const buttonParentId = '#btn-container';
	const addToBtnContainer = (text, onclick) => addButton(buttonParentId, text, onclick);
	addToBtnContainer(strings.averaging_method, methodToggleButton);
	addToBtnContainer(strings.show_disciplines, whiskerToggleButton);
	addToBtnContainer(strings.show_missing_journals, showMissingJournals);

	const articles = AssignWorksToDomains(works);
	DrawDomains(articles, GetDomainAngleBounds(Domains), strings);
	whiskerToggleButton()
}));

/**
	* @returns {Array} of article-type work objects with domain array added as property
**/
function AssignWorksToDomains(works) {
	var worksByJournal = {};
	works.forEach(function (w) {
		if(w.publicationType === 'article') justArticles++;
		if(w.journalTitle !== undefined && w.publicationType === 'article' && Journals[w.compJournalTitle] === undefined) {
			missingJournalsMap[w.journalTitle] = missingJournalsMap[w.journalTitle] ? missingJournalsMap[w.journalTitle]++ : 1;
			missingJournals++;
		}
		if(w.journalTitle !== undefined && w.publicationType === 'article' && Journals[w.compJournalTitle] !== undefined) {
			foundJournalsMap[w.compJournalTitle] = w.journalTitle;
		}
	})

	works
		.filter(function(w) {
			return w.publicationType === 'article' &&
			w.journalTitle !== undefined &&
			Journals[w.compJournalTitle] !== undefined
		})
		.forEach(function (w) {
			if(worksByJournal[w.compJournalTitle]){
				worksByJournal[w.compJournalTitle].amount++
			}
			else {


				w.domains = Journals[w.compJournalTitle].domains;
				w.discipline = Journals[w.compJournalTitle].disciplines[0].name;

				Domains.forEach(function (domain) {
					if(domain.topic === w.domains[0].name) {
						w.domains[0].hue = domain.hue
						domain.amount +=1
					}

				})
				w.amount = 1;
				w.index = 0;
				worksByJournal[w.compJournalTitle] = w;
			}
		});

	return Object.keys(worksByJournal).map(function (title) {
		return worksByJournal[title]
	})
}

function recomputeDomainWeights() {
	var sum = 0;
	Domains.forEach(function (d) {
		sum += d.amount + 3
	})

	Domains.forEach(function (domain) {
		var paddedAmount = domain.amount + 3

		domain.weight = paddedAmount / sum
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

function GetDisciplineAngleBounds(angleBounds, works, minUnit) {
	const domainToDiscliplinesMap = {}
	const disciplines = []
	works.forEach(function (work) {
		if(!domainToDiscliplinesMap[work.domains[0].name])
			domainToDiscliplinesMap[work.domains[0].name] = [work.discipline]

		else
			if(!(0 <= domainToDiscliplinesMap[work.domains[0].name].indexOf(work.discipline)))
				domainToDiscliplinesMap[work.domains[0].name].push(work.discipline)
	});


	angleBounds.filter(function (domain) {
		return !!domainToDiscliplinesMap[domain.topic] // filter out domains where no article was published
	}).forEach(function (domain) {
		var begin = domain.angleBounds.begin, span = domain.angleBounds.end - domain.angleBounds.begin
		var unit = span / domainToDiscliplinesMap[domain.topic].length;
		if(unit < minUnit) {
			unit = minUnit

		}
		for(var i = 0; i < domainToDiscliplinesMap[domain.topic].length; i++) {
			if(begin + unit * (i + 1) > domain.angleBounds.end) break;
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


		for(var j = 0; j < 8; j++) {
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


function Snorm(x, y) {
	return x+y-x*y;
}

function VecMult(v, s) {
	return v.map(x => x * s)
}
function VecAdd(v1, v2) {
	return v1.map((x, i) => x + v2[i])
}

function DrawDomains(articles, angleBounds, strings) {
	var svg = d3.select("#svg-port");
	const [width, height] = getDimensions('#svg-port');
	var radius = height / 2.5;
	var nodeRadius = 7
	var nodePadding = 3
	var ringWidth = 30;
	var slotRingPadding = 25;
	var centre =
		{
			x: width / 1.6,
			y: height / 2
		};

	const autDoms = {}
	Domains.forEach(d => autDoms[d.topic] = 0.0);

	const weights = [0.05, 0.02, 0.01];
	articles.forEach(a => {
		let topics = a.domains.map(d => d.name).filter(name => autDoms[name] !== undefined);
		topics.forEach((t, i) => {
			autDoms[t] = Snorm(autDoms[t], weights[i])
		})
	});

	var domainCoordinates = GetCartesianDomainCentres(angleBounds, radius);
	Object.keys(domainCoordinates).forEach(k => {
		domainCoordinates[k] = PolarToCartesian(domainCoordinates[k].angle - Math.PI / 4, radius)
	})

	const v = Object.keys(autDoms)
		.map(k => [domainCoordinates[k].x * autDoms[k], domainCoordinates[k].y * autDoms[k]]) // scale dom vectors
		.reduce(VecAdd, [0, 0])

	let maxTopic = "";
	let maxTopicVal = 0;
	Object.keys(autDoms).forEach(k => {
		if (autDoms[k] >= maxTopicVal) {
			maxTopic = k
			maxTopicVal = autDoms[k]
		}
	})



	let vnodes = [{
		x: v[0],
		y:v[1],
		maxTopic: maxTopic
		}];

	Object.keys(domainCoordinates).forEach(k => {
		vnodes.push({
			x: domainCoordinates[k].x,
			y: domainCoordinates[k].y,
			maxTopic: k
		})
	})

	var disciplineAngleBounds = GetDisciplineAngleBounds(angleBounds, articles, CartesianLengthToPolar(nodeRadius + nodePadding, radius));

	var publicationNodeSlotCoordinates = GetCartesianNodeSlots(disciplineAngleBounds, radius - ringWidth - slotRingPadding, slotRingPadding, nodeRadius, nodePadding)
	var disciplineToSlotCoordArrayMap = {};
	publicationNodeSlotCoordinates.forEach(function(domain) {
		disciplineToSlotCoordArrayMap[domain.discipline] = domain;
		disciplineToSlotCoordArrayMap[domain.discipline].counter = 0
	})

	var nodeTip = d3Tip().attr('class', 'd3-tip').html(function(d) {
		return strings.vis.domains[d.maxTopic];
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
			// .attr('transform', 'translate(' + 500 + ' , ' + 500 + ')')
			.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
			.attr('fill', function () {
				return angles.hue
			})

	});
	svg.call(nodeTip);

	var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(vnodes)
		.enter().append("circle")
		.attr("r", function (d) {
			return nodeRadius
		})
		.attr("fill", function (d) {
			return "#999999" // default to greyish to make plot more readable
			// return Domains.find(dom => dom.topic === d.maxTopic).hue
		})
		.attr("stroke", "#434343")
		.attr("stroke-width", "1px")
		.attr('cx', function (d, i) {
			return d.x
		})
		.attr('cy', function (d, i) {
			return d.y
		})
		// .attr('transform', 'translate(' + 500 + ' , ' + 500 + ')')
		.attr('transform', 'translate(' + centre.x + ' , ' + centre.y + ')')
		.on('mouseover', nodeTip.show)
		.on('mouseout', nodeTip.hide)

	DrawResearchMapKey(svg, width, height, strings)


//Draw node slots for debugging
/*
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
