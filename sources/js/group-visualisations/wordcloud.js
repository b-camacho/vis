
$(document).ready(function () {
	const svg = d3.select('#svg-port');

	const width = parseInt(svg.style('width').replace('px', ''));
	const height = parseInt(svg.style('height').replace('px', ''));


	$.post("wordcloudData", {width: width, height: height}, function (data) {

			console.log(data);
			displayWordcloud(data);
//                    displayWorkStatsWorksInTime(barData);
		}
	)
});




function displayWordcloud(textObjects) {
	const svg = d3.select('#svg-port');

	const width = parseInt(svg.style('width').replace('px', ''));
	const height = parseInt(svg.style('height').replace('px', ''));

	const colorScale = d3.scaleOrdinal(d3.schemeSet3)
		.domain([0, 10]);

	svg
		.append('g')
		.attr('id', 'polish')
		.attr('transform','translate( ' + [width/4, height/2] + ')')
		.selectAll('text')
		.data(textObjects.polish)
		.enter()
		.append('text')
		.text(function (d) {return d.text})
.attr('text-anchor', 'middle')
		.attr('transform', function (d) {return 'translate(' + [d.x, d.y] + ')' +
		'rotate(' + d.rotate + ')'})
.attr('fill', (d, i) => {return colorScale(i%10)})
//            .attr('width', (d)=>{return d.width})
//            .attr('height', (d)=>{return d.height})
.attr('font-family', 'sans-serif')
		.attr('text-anchor', 'middle')
		.attr('font-size', (d) => {return d.size });
	svg
		.append('g')
		.attr('id', 'english')
		.attr('transform','translate( ' + [width/1.3, height/2] + ')')
		.selectAll('text')
		.data(textObjects.english)
		.enter()
		.append('text')
		.text((d) => {return d.text})
.attr('text-anchor', 'middle')
		.attr('transform', (d) => {return 'translate(' + [d.x, d.y] + ')' +
		'rotate(' + d.rotate + ')'})
.attr('fill', (d, i) => {return colorScale(i%10)})
	//            .attr('width', (d)=>{return d.width})
	//            .attr('height', (d)=>{return d.height})
.attr('font-family', 'sans-serif')
		.attr('text-anchor', 'middle')
		.attr('font-size', (d) => {return d.size });

//            .attr('x', (d) => {return d.x})
//            .attr('y', (d) => {return d.y})
	//.attr('padding', (d) => {return d.padding});
//            .attr('transform', (d) => {
//                return 'translate( ' + [d.x, d.y] + ')';
//        })

}

/**
 *
 * @param rawData {Array} - DB records cotaining field title with the full title of the work
 * @returns {Array} - An array of all words in the titles of all works
 */
function getWordsArray(rawData) {

	var wordArray = [];

	rawData.map( function (record) {
		return record.title;
}).forEach( function (title, index) {
		if(title) wordArray = wordArray.concat(title.split(' '))
		else console.log('Undefined title at ' + index)
	});

	return wordArray;
}

// function genPdfDoc() {
// 	var $svg = document.querySelector('#svg-port')
// 		, doc = new PDFDocument({
// 		layout: 'landscape'
// 	})
// 		, stream = doc.pipe(blobStream());
// 	doc.fontSize(25)
// 		.text('Chmura slow kluczowych', 100, 40);
// 	doc.fontSize(12)
// 		.text('Wygenerowano przez ', {
// 			continued: true
// 		})
// 		.text('Wizualizator Dorobku Naukowego', {
// 			continued: true,
// 			link: 'http://visualizeme.umk.pl'
// 		})
// 		.text(' dla ' + authorName.normalize('NFD').replace(/[\u0300-\u036f]/g, ""));
//
//
// 	var scale = doc.page.width / $svg.width.baseVal.value;
// 	var width = $svg.width.baseVal.value;
// 	var height = $svg.height.baseVal.value;
// 	console.log(scale);
// //        $svg = $svg.cloneNode(true);
// 	$svg.setAttribute('transform', 'scale(' + scale + ')');
//
// 	SVGtoPDF(doc, $svg, 100, 100, {width: width, height: height});
//
//
//
//
//
// 	stream.on('finish', function() {
// 		console.log(stream.toBlobURL('application/pdf'));
// 		window.location = stream.toBlobURL('application/pdf');
// 	});
// 	doc.end();
//
// }
