import * as d3 from 'd3';
import {multiple} from "../util";
import d3Tip from 'd3-tip';
import {FetchCurrentWorks, FetchScriptableStrings, Work} from "../common";

class YearData {
	constructor (
		public works:number,
		public articles: number,
		public books: number,
		public edits: number,
		public year: number,
		public titles: Array<string>
	) {}
}

document.addEventListener('DOMContentLoaded', async function () {
	const works = await FetchCurrentWorks();
	const jsStrings = await FetchScriptableStrings();
	var barData = getBars(works);
	drawWorksOverTimeGraph(barData, jsStrings);
});

function drawWorksOverTimeGraph(data: Array<YearData>, jsStrings) {
	const red = "#f44336";
	const blue = "#26a69a";
	const stackMargin = 10;

	const svg = d3.select("#svg-port"),
		width = $(".svg-port").width(),
		height = $(".svg-port").height();
	svg.selectAll('*').remove();
	const barYearTip = d3Tip().attr('class', 'd3-tip')['html'](function (d) {
		return jsStrings.vis.year["1"] + " " + d.year + ': ' + d.works + " " + multiple(jsStrings.vis.work, d.works) +
		'.</br> ' + jsStrings.vis.including + " " + d.books + ' ' + jsStrings.vis.monographies + "." +
		(d.edits === 0 ? '' : '<br>' + d.titles.map(function(t){return t.length > 30 ? t.substr(0, 30) + '...' : t}).join("; "));
	});
	svg.call(barYearTip);

	const maxBarHeight = height / 2;
	const maxBarWidth = width;
	const yScaleWidth = 30;
	const xScale = d3.scaleBand()
		.domain(data.map(function (el) {
			return el.year.toString();
		}))
		.range([0, maxBarWidth - yScaleWidth])
		.paddingInner(0.1)
		.paddingOuter(0.2)
	const yScale = d3.scaleLinear()
		.domain([0, d3.max(data, function (d) {
			return Number.parseInt(d.works.toString())
		})])
		.range([0, maxBarHeight]);

	if (svg.select('g').empty()) svg.append('g').attr('id', 'bars');
	const bars = svg.select('g')
		.selectAll('rect')
		.data(data);
	bars.enter().append('rect')
		.attr('width', xScale.bandwidth())
		.attr('x', function (d) {
			return xScale(d.year.toString());
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
			return xScale(d.year.toString());
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
			return xScale(d.year.toString());
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
		});

	bars.exit()
		.transition()
		.duration(300)
		.attr('width', 0)
		.remove();
	const xAxis = d3.axisBottom(xScale);
	svg.append('g').attr('id', 'x-axis').call(xAxis).attr('transform', 'translate( ' + [-width, height / 2] + ')').transition().duration(1000).attr('transform', 'translate( ' + [yScaleWidth, height - 20] + ')');
	const yAxis = d3.axisLeft(yScale.domain(yScale.domain().reverse()));
	svg.append('g').attr('id', 'y-axis').call(yAxis).attr('transform', 'translate( ' + [0, height * 2] + ')').transition().duration(1000).attr('transform', 'translate( ' + [30, height - maxBarHeight - 20] + ')');
	//svg.select('g').call(xAxis).attr('width', 0).transition().duration(1000).attr('width', width);

}

function getBars(allWorks):Array<YearData> {
	allWorks = allWorks.map(function (el) {
		if (Number.parseInt(el.year) < 1900) {
			el.year = Number.parseInt(el.year) - (-1000);
		}
		else el.year = Number.parseInt(el.year);
		return el;
	});

	allWorks.sort(dynamicSort('year'));

	const bars = [];
	
	for (let i = 0; i < (allWorks[allWorks.length - 1].year - allWorks[0].year - (-1)); i++) {
		bars.push(countYearOccurences(allWorks[0].year - (-i), allWorks))
	}

	return bars;
}

function countYearOccurences(year, arr):YearData {
	const res = new YearData(0,0,0,0,year, []);
	arr.forEach(function (el) {
		if (el.year === year) {
			res.works++;
			if(el.publicationType === 'book') res.books++;
			if(el.publicationType === 'edit') {
				res.edits++;
				res.titles.push(el.title);
			}
			if(el.publicationType === 'article') res.articles++;
		}
	});
	return res;
}

function dynamicSort(property) {
	return function (a, b) {
		return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
	}
}