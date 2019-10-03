import * as d3 from 'd3';
import {multiple, clearSvg} from "../util";
import d3Tip from 'd3-tip';
import {Work, InjectContext} from "../common";

document.addEventListener('DOMContentLoaded', () => InjectContext( (works, strings) => {
	if(works.filter(function (work) {
		return work.publicationType === 'edit'
	}).length < 3) {
		document.querySelector('#toggleView').setAttribute('disabled', 'disabled');
	}
	drawSimulationCollaborationGraph(getNodes(works, false), strings);
}));

function drawSimulationCollaborationGraph(data) {
	clearSvg();


	var sizeScale = d3.scalePow().exponent(1/2)
		.domain(
			[
				d3.min(data.simNodes, function (d) {return d.strengthValue;}),
				d3.max(data.simNodes, function (d) {return d.strengthValue;})
			])
		.range([10, 40]);


	var svg = d3.select("#svg-port"),
		width = $(".svg-port").width() * 3 / 4,
		height = $(".svg-port").height() * 3 / 4;

	data.simNodes[0].fx = width / 2;
	data.simNodes[0].fy = height / 2;

	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink()
			.id(function (d) {return d.id; })
			.distance(function (d) {
				return Math.min(width, height)/2 / d.value
			}))
		.force("charge",
			d3.forceManyBody()
				.strength(function() {
					return -500;
				}))
		.force("center",
			d3.forceCenter(width / 2, height / 2));

	var nodeTip = d3.tip().attr('class', 'd3-tip').html(function(d) { return d.id + '; ' + d.strengthValue + " " + multiple(jsStrings.vis.work, d.strengthValue)});
	svg.call(nodeTip);

	var link = svg.append("g")
		.attr("class", "links")
		.attr('transform', 'translate(' + [width / 4, height / 4] + ')')
		.selectAll("line")
		.data(data.simLinks)
		.enter().append("line")
		.attr("stroke-width", function (d) {
			return Math.sqrt(d.value) * 1.5;
		})
		.style("stroke", d3.rgb(69,67,67))
		.style("stroke-opacity", 0.5);

	var node = svg.append("g")
		.attr('transform', 'translate(' + [width / 4, height / 4] + ')')
		.attr("class", "nodes")
		.selectAll("circle")
		.data(data.simNodes)
		.enter().append("circle")
		.attr("r", function (d) {
			return sizeScale(d.strengthValue)
		})
		.attr("fill", function (d) {
			return NextColor();
		})
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended))
		.on('mouseover', nodeTip.show)
		.on('mouseout', nodeTip.hide);

	simulation
		.nodes(data.simNodes)
		.on("tick", ticked);

	simulation.force("link")
		.links(data.simLinks);

	function ticked() {
		link
			.attr("x1", function (d) {
				return d.source.x;
			})
			.attr("y1", function (d) {
				return d.source.y;
			})
			.attr("x2", function (d) {
				return d.target.x;
			})
			.attr("y2", function (d) {
				return d.target.y;
			});

		node
			.attr("cx", function (d) {
				return d.x;
			})
			.attr("cy", function (d) {
				return d.y;
			});
	}

	function dragstarted(d) {
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}
}

var colorCounter = 0;
function NextColor() {
	if (colorCounter >= 9) colorCounter = 0;
	return d3.schemeSet2[colorCounter++];
}

function getNodes (allWorks, showEdits) {
	var authorsSet = new Set();
	allWorks = allWorks.filter(function (work) {
		return (work.publicationType === 'edit') === showEdits
	});
	console.log(allWorks)
	var authorLists = allWorks.map(function (el) {
		if(!el.authors) return;
		el.authors.forEach(function (person) {
			authorsSet.add(person);
		});
		return el.authors;
	});
	var centralAuthor, centralAuthorWorks = 0;
	authorsSet.forEach(function (author) {
		var potentialCentralAuthorWorks = 0;
		authorLists.forEach(function (list) {
			if(list.indexOf(author) != -1) potentialCentralAuthorWorks++;
		})
		if(potentialCentralAuthorWorks > centralAuthorWorks) {
			centralAuthorWorks = potentialCentralAuthorWorks;
			centralAuthor = author;
		}
	})

	// console.log('Query made by: ' + centralAuthor);
	// console.log('This person has ' + centralAuthorWorks + ' works out of ' + authorLists.length + ' in this set of records.');

	var collaboratorsObject = {};
	var collaborators = [];

	authorLists.forEach(function (list) {
		list.forEach(function (person) {
			if(person != centralAuthor) {
				if(collaboratorsObject[person] != undefined) collaboratorsObject[person]++;
				else collaboratorsObject[person] = 1;
			}
		})
	})


	// console.log(collaboratorsObject);

	var simCentralAuthorObject = {
		id: centralAuthor,
		strengthValue: centralAuthorWorks,
	}

	var simNodes = [simCentralAuthorObject];
	var simLinks = [];

	for(var name in collaboratorsObject) {
		if(collaboratorsObject.hasOwnProperty(name))
		{
			simNodes.push({id: name, strengthValue: collaboratorsObject[name]});
		}
	}
	for (var name in collaboratorsObject) {
		if(collaboratorsObject.hasOwnProperty(name))
		{
			simLinks.push({source: centralAuthor, target: name, value: collaboratorsObject[name]});
		}
	}

	return {
		simNodes: simNodes,
		simLinks: simLinks
	};
}

var toggled = false;
function showEdits() {
	toggled = !toggled;
	clearSvg();

	document.querySelector('#toggleView').innerHTML = toggled ? 'Widok standardowy' : 'Widok prac redagowanych';
	drawSimulationCollaborationGraph(getNodes(rawData, toggled))
}
