import {FetchDept, DeserializeResearchers, PublicationType, Researcher, Work} from '../common'
import {
    rgb,
    drag,
    select,
    forceSimulation,
    forceCollide,
    forceLink,
    forceManyBody,
    forceX,
    forceY,
    SimulationNodeDatum,
    SimulationLinkDatum,
    event,
    schemeSet2,
    scalePow,
} from 'd3';
import {Point} from "../util"
import d3Tip from 'd3-tip';

class Hub extends Point implements SimulationNodeDatum {
    vx: number;
    vy: number;
    fx: number;
    fy: number;
    isHub: boolean;
    simLinks: Array<SimLink>;

    add(k: CollabResearcher, n: number) {
        if (!this.authors.has(k)) {
            this.authors.set(k, 0)
        }
        this.authors.set(k, this.authors.get(k) + n)
    }

    constructor(public name: String, public authors: Map<CollabResearcher, number>, public id: String) {
        super();
        this.isHub = true;

    }
}

class CollabResearcher extends Researcher implements SimulationNodeDatum {
    x: number;
    y: number;
    vx: number;
    vy: number;

    links: Map<string, number>;
    simLinks: Array<SimLink>;

    worksAmount: number;

    add(k: string, n: number) {
        if (!this.links.has(k)) {
            this.links.set(k, 0)
        }
        this.links.set(k, this.links.get(k) + n)
    }

    isHub: boolean;

    constructor() {
        super();
        this.links = new Map<string, number>();
        this.isHub = false;
    }
}

class CollabWork extends Work {
    hub: string;
    authors: Array<CollabResearcher>;
}

class SimLink implements SimulationLinkDatum<SimulationNodeDatum> {
    constructor(public source: SimulationNodeDatum, public target: SimulationNodeDatum, public value: number) {
    };
}

window.addEventListener('DOMContentLoaded', async function () {
    const deptRequests = Promise.all(['WCH',].map(dname => FetchDept(dname)));
    const depts = await deptRequests;
    let processedWorks = new Array<CollabWork>();
    let researchers = new Array<CollabResearcher>();
    for (const dept of depts) {
        const newWorks = processWorks(dept.works, dept.name);
        const newResearchers = DeserializeResearchers(newWorks, dept.name)
            .filter((_, i) => i < 500).map(r => {
                const cR = new CollabResearcher();
                cR.worksAmount = r.worksAmount;
                cR.name = r.name;
                return cR;
            });

        researchers = researchers.concat(newResearchers);
        processedWorks = processedWorks.concat(newWorks);
    }
    // remove all works that do not belong to the selected researchers
    const s = new Set(researchers.map(r => r.name));
    processedWorks = processedWorks.filter(w => !!w && w.authors.every(a => {
        const anyA = a as any;
        return s.has(anyA)
    }));
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

    return works
}

function processWorks(works: Array<Work>, deptname: string): Array<CollabWork> {

    const articles = works.filter(w => w.publicationType === PublicationType.Article);

    return articles.map(art => {

        let cW = art as CollabWork;
        cW.hub = deptname; //'H' + Math.floor((Math.random() * 4 + 1)).toString();
        return cW
    });
}


function scaleLog2(x) {
    return Math.min(
        100,
        Math.log2(x + 1)
    )
}

function draw(works: Array<CollabWork>, researchers: Array<CollabResearcher>) {
    const svg = select("#svg-port"),
        jQPort = $("#svg-port"),
        width = jQPort.width(),
        height = jQPort.height(),
        radius = Math.min(height, width) / 4;
    const NODE_MAX_RADIUS = 20, NODE_MIN_RADIUS = 4;
    const HUB_RADIUS = 20;

    const scaleRadius = scalePow()
        .exponent(0.75)
        .domain([1, researchers.reduce((curMax, r) => Math.max(curMax, r.worksAmount), 0)])
        .range([NODE_MIN_RADIUS, NODE_MAX_RADIUS]);

    // initialise object with one key for each author

    const authors = new Map<String, CollabResearcher>();

    researchers.forEach(r => {
        authors.set(r.name, r)
    });

    for (const w of works) {
        const anyauts = w.authors as any;
        w.authors = anyauts.map(a => authors.get(a))
    }

    // assign authors to each other
    for (const w of works) {
        if (w.authors.length > 1) {
            for (const a1 of w.authors) {
                for (const a2 of w.authors) {
                    if (a1.name === a2.name) continue;
                    authors.get(a1.name).add(a2.name, 1);
                }
            }
        }
    }
    // create links author -> author
    for (const [i, author] of authors) {
        author.simLinks = Array.from(author.links).map(([otherName, count]) =>
            new SimLink(author, authors.get(otherName), count)
        )
    }

    const simNodes = Array.from(authors).map(([k, aut]) => aut); // concat rest of nodes (author nodes)
    const simLinks = Array.from(authors).flatMap(([_, a]) => a.simLinks);

    var simulation = forceSimulation(simNodes)
        .force("link", forceLink(simLinks).strength(function (d) {
            return 1 - (1 / (1 + d.value))
        }))
        .force("charge", forceManyBody().strength(-40))
        .force("x", forceX().strength(0.04))
        .force("y", forceY().strength(0.04))
        .force("collide", forceCollide(function (d:CollabResearcher) {
            return scaleRadius(d.worksAmount) * 1.5
        }))
        // .stop();

    /* Initialize tooltip */
    const anytip = d3Tip as any;
    const myTip = anytip().attr('class', 'd3-tip').html((d) => d.name + ' : ' + d.worksAmount);

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
    // 	})
    // 	.on('mouseover', myTip.show)
    // 	.on('mouseout', myTip.hide);

    // hub.call(myTip)


    const link = svg.append("g")
        .attr("class", "links")
        .attr('transform', 'translate(' + [width / 2, height / 2] + ')')
        .selectAll("line")
        .data(simLinks)
        .enter().append("line")
        .attr("stroke-width", function (d) {
            return scaleLog2(d.value);
        })
        .style("stroke", rgb(69, 67, 67).toString())
        .style("stroke-opacity", 0.2);

    const node = svg.append("g")
        .attr('transform', 'translate(' + [width / 2, height / 2] + ')')
        .attr("class", "nodes")
        .selectAll("circle")
        .data(simNodes)
        .enter().append("circle")
        .attr("r", function (d) {
            return scaleRadius(d.worksAmount)
        })
        .attr("cx", function (d) {
            return d.x
        })
        .attr("cy", function (d) {
            return d.y
        })
        .attr("fill", function (d) {
            return NextColor();
        })
        .attr("id", function (d) {
            return d['id'];
        })
        .on('mouseover', myTip.show)
        .on('mouseout', myTip.hide)
        // .call(drag()
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));

    node.call(myTip)


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

    // for (let i = 0; i < 100; i++) {2
    simulation.tick(100)
    // }

    // function dragstarted(d) {
    //     if (!event.active) simulation.alphaTarget(0.3).restart();
    //     d.fx = d.x;
    //     d.fy = d.y;
    // }
    //
    // function dragged(d) {
    //     d.fx = event.x;
    //     d.fy = event.y;
    // }
    //
    // function dragended(d) {
    //     if (!event.active) simulation.alphaTarget(0);
    //     d.fx = null;
    //     d.fy = null;
    // }

}

var colorCounter = 0;

function NextColor() {
    if (colorCounter >= 8) colorCounter = 0;
    return schemeSet2[colorCounter++];
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
    select('svg').selectAll('*').remove();
}

function DeclinatePolishWordPraca(word, number) {
    if (number == 1) return number + ' praca'
    if (number >= 2 && number <= 4) return number + ' prace'
    return number + ' prac'
}
