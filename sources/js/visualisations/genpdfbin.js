function genPdfDoc() {
	var $svgPort = $('#svg-port');
	$.post('/genPdf',
		{
			svg: '<svg ' + $svgPort[0].innerHTML + '</svg>' ,
			args: {
				type: visname,
				width: $svgPort.width(),
				height: $svgPort.height(),
				title: jsStrings.vis_titles[visname],
				caption: jsStrings.pdf_caption,
				caption_title: jsStrings.pdf_caption_title,
				for: jsStrings.for,
				authorName: authorName,
				orientation: 'landscape'
			}
		},
		function (response) {
			window.location = response
		},
		"text")
}
