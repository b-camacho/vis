import {FetchDept, DeserializeResearchers, PublicationType, Researcher, Work} from '../common';
import * as $ from 'jquery'
import * as d3 from 'd3'
import {SimulationLinkDatum, SimulationNodeDatum} from 'd3'
import {Point, RadPoint} from "../util";

class Hub extends Point implements SimulationNodeDatum {
	vx:number;
	vy:number;
	fx:number;
	fy:number;
	isHub:boolean;
	simLinks: Array<SimLink>;

	add(k: CollabResearcher, n:number) {
		if (!this.authors.has(k)) {
			this.authors.set(k, 0)
		}
		this.authors.set(k, this.authors.get(k) + n)
	}

	constructor(public name:String, public authors:Map<CollabResearcher, number>, public id:String){
		super();
		this.isHub = true;

	}
}
class CollabResearcher extends Researcher implements SimulationNodeDatum {
	x:number;
	y:number;
	vx:number;
	vy:number;

	id:string;
	links: Map<string, number>;
	simLinks: Array<SimLink>;

	add(k: string, n:number) {
		if (!this.links.has(k)) {
			console.log('Adding ' + k);
			this.links.set(k, 0)
		}
		this.links.set(k, this.links.get(k) + n)
	}

	isHub:boolean;
	constructor() {
		super();
		this.links = new Map<string, number>();
		this.isHub = false;
	}
}

class CollabWork extends Work {
	hub:string;
	id:string;
	authors: Array<CollabResearcher>;
}

class SimLink implements SimulationLinkDatum<CollabResearcher> {
	constructor(public source: string, public target:string, public value:number){};
}


var rawData;
window.addEventListener('DOMContentLoaded', async function () {
	let dept = await FetchDept("WF");
	const processedWorks = processWorks(dept.works);
	const researchers = DeserializeResearchers(processedWorks).map(r => {
		const cR = new CollabResearcher();
		cR.id = r.name;
		return cR
	});

	dept = null;

	draw(processedWorks, researchers);

});
// function reload() {
// 	clearSvg();
// 	draw(generateData());
// }
function generateData() {
	const randstr = () => Math.random().toString(36).substr(2, 5);
	const authors = [...Array(30)].map(
		_ => randstr()
	);
	const hubs = ["A", "B", "C", "D", "E", "F"];

	const randomHub = () => {
		let r = Math.random();
		for (let h of hubs) {
			if (r < 0.33) return h;
			r = Math.random();
		}
		return hubs[hubs.length - 1]
	}

	const works = [...Array(100)].map(
		(el, i) => ({
			authors: [authors[i % authors.length]],
			title: randstr(),
			hub: randomHub(),
		})).map(
			(el, i) => {
				for (let _ of Array(i % 5)) {
					let randAuthor = authors[Math.floor(Math.random())];
					if (el.authors.indexOf(randAuthor) === -1) {
						el.authors.push(randAuthor)
					}
				}
				return el
			}
		);
	console.log(works);

	return works
}

function processWorks(works:Array<Work>):Array<CollabWork> {

	const articles = works.filter(w => w.publicationType === PublicationType.Article).filter((_, i) => i < 200);

	return articles.map(art => {
		let cW = art as CollabWork;
		cW.hub = 'H' + Math.floor((Math.random() * 4 + 1)).toString();
		cW.id = art.title;
		return cW
	});
}


function scaleLog2(x) {
	return Math.min(
		100,
		Math.log2(x + 1)
	)
}

function draw(works:Array<CollabWork>, researchers:Array<CollabResearcher>) {
	// console.log(works)
	const svg = d3.select("#svg-port"),
		jQPort = $("#svg-port"),
		width = jQPort.width(),
		height = jQPort.height(),
		radius = Math.min(height, width) / 4;

	const hubs = new Map<String, Hub>();

	// initialising hubs

	works.forEach(d => {
		if (!hubs.has(d.hub)) {
			hubs.set(d.hub, new Hub(d.hub, new Map<CollabResearcher, number>(), "HID:" + d.hub));
		}
	});

	// finding hub centres
	let tmp = 0;
	for(const [i, hub] of hubs) {
		const rad = new RadPoint((tmp / hubs.size) * 2 * Math.PI, radius);
		tmp += 1;
		const coords = rad.ToCart();
		hub.x = coords.x;
		hub.y = coords.y;
	}

	// Object.keys(hubs).forEach((h, i) => {
	// 	Object.assign(hubs[h], PolarToCartesian(
	// 		(i / hubs.size) * 2 * Math.PI, radius
	// 	))
	// });

	// initialise object with one key for each author

	const authors = new Map<String, CollabResearcher>();

	researchers.forEach(r => {
		authors.set(r.id, r)
	})

	for (const w of works) {
		const anyauts = w.authors as any;
		w.authors = anyauts.map(a => authors.get(a))
	}
	// console.log(works)

	// assign authors to each other
	for (const w of works) {
		for (const a1 of w.authors) {
			for (const a2 of w.authors) {
				if (a1.name === a2.name) continue;
				authors.get(a1.name).add(a2.name, 1);
			}
		}
	}


	// works.forEach(d => {
	// 	d.authors.forEach((a, i) => {
	// 		d.authors.forEach((aa, j) => {
	// 			if (aa !== a) {
	// 				if (authors[a].links[aa] === undefined) {
	// 					authors[a].links[aa] = 0;
	// 				}
	// 				authors[a].links[aa] += 1;
	// 			}
	// 		})
	// 	});
	// });


	// adding authors to hubs
	for (const w of works) {
		for (const aut of w.authors) {
			const hub = hubs.get(w.hub);
			hub.add(aut, 1);
		}
	}

	// works.forEach((d, i) => {
	// 	d.authors.forEach(aName => {
	// 		const a = authors[aName];
	// 		if (!a) return;
	// 		const hasAuthor = hubs[d.hub].authors[a.id];
	//
	// 		if (!hasAuthor) {
	// 			hubs[d.hub].authors[a.id] = 0;
	// 		}
	// 		hubs[d.hub].authors[a.id] += 1;
	// 	})
	// })
	// console.log(hubs);

	// create links author -> hub
	for (const [_, hub] of hubs) {
		hub.simLinks = Array.from(hub.authors).map(([author, count]) =>
			new SimLink(hub.id.toString(), author.id, count))
	}

	// adding links author -> hub
	// Object.keys(hubs).forEach((h, i) => {
	// 	hubs[h].simLinks = Object.keys(hubs[h].authors).map(
	// 		(aId, i) => ({source: hubs[h].id, target: aId, value: hubs[h].authors[aId]})
	// 	)
	// })

	for (const [i, author] of authors) {
		// console.log(author.links)
		author.simLinks = Array.from(author.links).map(([otherName, count]) =>
			new SimLink(author.id, otherName, count / 5)
		)
	}

	// // adding links author -> author
	// Object.keys(authors).forEach((a, i) => {
	// 	authors[a].simLinks = Object.keys(authors[a].links).map(
	// 		(other, i) => ({source: a, target: other, value: authors[a].links[other] / 5})
	// 	)
	// });
	let simNodes = new Array<SimulationNodeDatum>();

	simNodes = simNodes
		.concat(
			Array.from(hubs)
				.map(([k, h]) =>
					Object.assign(h, {fx: h.x, fy:h.y}))) // add fixed x and y to hubs
		.concat(
			Array.from(authors).map(([k, aut]) => aut) // concat rest of nodes (author nodes)
		);

	const simLinks = Array.from(hubs)
		.flatMap(([k,  h]) => h.simLinks)
		.concat(
			Object.values(authors).flatMap(a => a.simLinks)
		);

	// console.log(simNodes);
	// console.log(simLinks);
	// console.log(simLinks[0].source);
	// console.log(simLinks[0].target);

	var simulation = d3.forceSimulation(simNodes)
		.force("link", d3.forceLink(simLinks)
				.id(function (d:CollabResearcher) {return d.id; })
				.distance(function (d) {
					return 40
				})
				.strength(function (d) {
					return scaleLog2(d.value)
				})
			)
		.force("collide", d3.forceCollide(10))
		// .force("charge",
		// 	d3.forceManyBody()
		// 		.strength(function() {
		// 			return -15;
		// 		}))

		// .force("center",
		// 	d3.forceCenter(0, 0));

	// const hub = svg.append("g")
	// 	.attr('transform', 'translate(' + [height / 2, width / 2] + ')')
	// 	.attr("class", "hubs")
	// 	.selectAll("circle")
	// 	.data(Object.values(hubs))
	// 	.enter().append("circle")
	// 	.attr("cx", function (d) {
	// 		return d.x
	// 	})
	// 	.attr("cy", function (d) {
	// 		return d.y
	// 	})
	// 	.attr("r", '32px')
	// 	.attr("fill", function (d) {
	// 		return NextColor();
	// 	});



	const link = svg.append("g")
		.attr("class", "links")
		.attr('transform', 'translate(' + [width / 2, height / 2] + ')')
		.selectAll("line")
		.data(simLinks)
		.enter().append("line")
		.attr("stroke-width", function (d) {
			return scaleLog2(d.value);
		})
		.style("stroke", d3.rgb(69,67,67).toString())
		.style("stroke-opacity", 0.2);

	const node = svg.append("g")
		.attr('transform', 'translate(' + [width / 2, height / 2] + ')')
		.attr("class", "nodes")
		.selectAll("circle")
		.data(simNodes)
		.enter().append("circle")
		.attr("r", function (d) {
			return d['isHub'] ? 30 : 10;
		})
		.attr("cx", function (d) {
			return d.fx ? d.fx : d.x
		})
		.attr("cy", function (d) {
			return d.fy ? d.fy : d.y
		})
		.attr("fill", function (d) {
			return NextColor();
		})
		.attr("id", function (d) {
			return d['id'];
		})





	simulation
		.on("tick", ticked);


	function ticked() {
		link
			.attr("x1", function (d) {
				return d.source['x'];
			})
			.attr("y1", function (d) {
				return d.source['y'];
			})
			.attr("x2", function (d) {
				return d.target['x'];
			})
			.attr("y2", function (d) {
				return d.target['y'];
			});

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
	if (colorCounter >= 8) colorCounter = 0;
	return d3.schemeSet2[colorCounter++];
}

/*

function drawSimulationCollaborationGraph(data) {
	// console.log(data);
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


	// console.log(width + ' ' + height);

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


	// console.log('Simulation finished')
}

*/

/*

function getNodes (allWorks, showEdits) {
	var authorsSet = new Set();
	allWorks = allWorks.filter(function (work) {
		return (work.publicationType === 'edit') === showEdits
	});
	// console.log(allWorks)
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
*/
/*

var toggled = false;
function showEdits() {
	toggled = !toggled;
	clearSvg();

	document.querySelector('#toggleView').innerHTML = toggled ? 'Widok standardowy' : 'Widok prac redagowanych';
	drawSimulationCollaborationGraph(getNodes(rawData, toggled))
}

*/



function clearSvg() {
	d3.select('svg').selectAll('*').remove();
}

function PolskaFleksjaSlowaPraca(word, number) {
	if(number == 1) return number + ' praca'
	if(number >=2 && number <=4) return number + ' prace'
	return number + ' prac'
}
