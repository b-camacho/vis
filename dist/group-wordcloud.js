/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./sources/js/group-visualisations/wordcloud.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./sources/js/group-visualisations/wordcloud.js":
/*!******************************************************!*\
  !*** ./sources/js/group-visualisations/wordcloud.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {


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


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc291cmNlcy9qcy9ncm91cC12aXN1YWxpc2F0aW9ucy93b3JkY2xvdWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7OztBQ2pGQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBLDBCQUEwQiw2QkFBNkI7O0FBRXZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7OztBQUtEO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsY0FBYztBQUNwQztBQUNBLG1DQUFtQztBQUNuQyw2QkFBNkI7QUFDN0IseUJBQXlCLHdCQUF3QjtBQUNqRCxtQ0FBbUMsZUFBZTtBQUNsRCxvQ0FBb0MsZ0JBQWdCO0FBQ3BEO0FBQ0E7QUFDQSw2QkFBNkIsZUFBZTtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGNBQWM7QUFDOUI7QUFDQSw2QkFBNkI7QUFDN0IsNkJBQTZCO0FBQzdCLHlCQUF5Qix3QkFBd0I7QUFDakQsb0NBQW9DLGVBQWU7QUFDbkQscUNBQXFDLGdCQUFnQjtBQUNyRDtBQUNBO0FBQ0EsNkJBQTZCLGVBQWU7O0FBRTVDLGlDQUFpQyxXQUFXO0FBQzVDLGlDQUFpQyxXQUFXO0FBQzVDLDRCQUE0QixpQkFBaUI7QUFDN0M7QUFDQTtBQUNBLFdBQVc7O0FBRVg7O0FBRUE7QUFDQTtBQUNBLG1CQUFtQixNQUFNO0FBQ3pCLGFBQWEsTUFBTTtBQUNuQjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBLEVBQUU7O0FBRUY7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUNBQW1DLDZCQUE2QjtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSIsImZpbGUiOiJncm91cC13b3JkY2xvdWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NvdXJjZXMvanMvZ3JvdXAtdmlzdWFsaXNhdGlvbnMvd29yZGNsb3VkLmpzXCIpO1xuIiwiXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbiAoKSB7XG5cdGNvbnN0IHN2ZyA9IGQzLnNlbGVjdCgnI3N2Zy1wb3J0Jyk7XG5cblx0Y29uc3Qgd2lkdGggPSBwYXJzZUludChzdmcuc3R5bGUoJ3dpZHRoJykucmVwbGFjZSgncHgnLCAnJykpO1xuXHRjb25zdCBoZWlnaHQgPSBwYXJzZUludChzdmcuc3R5bGUoJ2hlaWdodCcpLnJlcGxhY2UoJ3B4JywgJycpKTtcblxuXG5cdCQucG9zdChcIndvcmRjbG91ZERhdGFcIiwge3dpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9LCBmdW5jdGlvbiAoZGF0YSkge1xuXG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdGRpc3BsYXlXb3JkY2xvdWQoZGF0YSk7XG4vLyAgICAgICAgICAgICAgICAgICAgZGlzcGxheVdvcmtTdGF0c1dvcmtzSW5UaW1lKGJhckRhdGEpO1xuXHRcdH1cblx0KVxufSk7XG5cblxuXG5cbmZ1bmN0aW9uIGRpc3BsYXlXb3JkY2xvdWQodGV4dE9iamVjdHMpIHtcblx0Y29uc3Qgc3ZnID0gZDMuc2VsZWN0KCcjc3ZnLXBvcnQnKTtcblxuXHRjb25zdCB3aWR0aCA9IHBhcnNlSW50KHN2Zy5zdHlsZSgnd2lkdGgnKS5yZXBsYWNlKCdweCcsICcnKSk7XG5cdGNvbnN0IGhlaWdodCA9IHBhcnNlSW50KHN2Zy5zdHlsZSgnaGVpZ2h0JykucmVwbGFjZSgncHgnLCAnJykpO1xuXG5cdGNvbnN0IGNvbG9yU2NhbGUgPSBkMy5zY2FsZU9yZGluYWwoZDMuc2NoZW1lU2V0Mylcblx0XHQuZG9tYWluKFswLCAxMF0pO1xuXG5cdHN2Z1xuXHRcdC5hcHBlbmQoJ2cnKVxuXHRcdC5hdHRyKCdpZCcsICdwb2xpc2gnKVxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCd0cmFuc2xhdGUoICcgKyBbd2lkdGgvNCwgaGVpZ2h0LzJdICsgJyknKVxuXHRcdC5zZWxlY3RBbGwoJ3RleHQnKVxuXHRcdC5kYXRhKHRleHRPYmplY3RzLnBvbGlzaClcblx0XHQuZW50ZXIoKVxuXHRcdC5hcHBlbmQoJ3RleHQnKVxuXHRcdC50ZXh0KGZ1bmN0aW9uIChkKSB7cmV0dXJuIGQudGV4dH0pXG4uYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcblx0XHQuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24gKGQpIHtyZXR1cm4gJ3RyYW5zbGF0ZSgnICsgW2QueCwgZC55XSArICcpJyArXG5cdFx0J3JvdGF0ZSgnICsgZC5yb3RhdGUgKyAnKSd9KVxuLmF0dHIoJ2ZpbGwnLCAoZCwgaSkgPT4ge3JldHVybiBjb2xvclNjYWxlKGklMTApfSlcbi8vICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgKGQpPT57cmV0dXJuIGQud2lkdGh9KVxuLy8gICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgKGQpPT57cmV0dXJuIGQuaGVpZ2h0fSlcbi5hdHRyKCdmb250LWZhbWlseScsICdzYW5zLXNlcmlmJylcblx0XHQuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcblx0XHQuYXR0cignZm9udC1zaXplJywgKGQpID0+IHtyZXR1cm4gZC5zaXplIH0pO1xuXHRzdmdcblx0XHQuYXBwZW5kKCdnJylcblx0XHQuYXR0cignaWQnLCAnZW5nbGlzaCcpXG5cdFx0LmF0dHIoJ3RyYW5zZm9ybScsJ3RyYW5zbGF0ZSggJyArIFt3aWR0aC8xLjMsIGhlaWdodC8yXSArICcpJylcblx0XHQuc2VsZWN0QWxsKCd0ZXh0Jylcblx0XHQuZGF0YSh0ZXh0T2JqZWN0cy5lbmdsaXNoKVxuXHRcdC5lbnRlcigpXG5cdFx0LmFwcGVuZCgndGV4dCcpXG5cdFx0LnRleHQoKGQpID0+IHtyZXR1cm4gZC50ZXh0fSlcbi5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuXHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAoZCkgPT4ge3JldHVybiAndHJhbnNsYXRlKCcgKyBbZC54LCBkLnldICsgJyknICtcblx0XHQncm90YXRlKCcgKyBkLnJvdGF0ZSArICcpJ30pXG4uYXR0cignZmlsbCcsIChkLCBpKSA9PiB7cmV0dXJuIGNvbG9yU2NhbGUoaSUxMCl9KVxuXHQvLyAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIChkKT0+e3JldHVybiBkLndpZHRofSlcblx0Ly8gICAgICAgICAgICAuYXR0cignaGVpZ2h0JywgKGQpPT57cmV0dXJuIGQuaGVpZ2h0fSlcbi5hdHRyKCdmb250LWZhbWlseScsICdzYW5zLXNlcmlmJylcblx0XHQuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcblx0XHQuYXR0cignZm9udC1zaXplJywgKGQpID0+IHtyZXR1cm4gZC5zaXplIH0pO1xuXG4vLyAgICAgICAgICAgIC5hdHRyKCd4JywgKGQpID0+IHtyZXR1cm4gZC54fSlcbi8vICAgICAgICAgICAgLmF0dHIoJ3knLCAoZCkgPT4ge3JldHVybiBkLnl9KVxuXHQvLy5hdHRyKCdwYWRkaW5nJywgKGQpID0+IHtyZXR1cm4gZC5wYWRkaW5nfSk7XG4vLyAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCAoZCkgPT4ge1xuLy8gICAgICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoICcgKyBbZC54LCBkLnldICsgJyknO1xuLy8gICAgICAgIH0pXG5cbn1cblxuLyoqXG4gKlxuICogQHBhcmFtIHJhd0RhdGEge0FycmF5fSAtIERCIHJlY29yZHMgY290YWluaW5nIGZpZWxkIHRpdGxlIHdpdGggdGhlIGZ1bGwgdGl0bGUgb2YgdGhlIHdvcmtcbiAqIEByZXR1cm5zIHtBcnJheX0gLSBBbiBhcnJheSBvZiBhbGwgd29yZHMgaW4gdGhlIHRpdGxlcyBvZiBhbGwgd29ya3NcbiAqL1xuZnVuY3Rpb24gZ2V0V29yZHNBcnJheShyYXdEYXRhKSB7XG5cblx0dmFyIHdvcmRBcnJheSA9IFtdO1xuXG5cdHJhd0RhdGEubWFwKCBmdW5jdGlvbiAocmVjb3JkKSB7XG5cdFx0cmV0dXJuIHJlY29yZC50aXRsZTtcbn0pLmZvckVhY2goIGZ1bmN0aW9uICh0aXRsZSwgaW5kZXgpIHtcblx0XHRpZih0aXRsZSkgd29yZEFycmF5ID0gd29yZEFycmF5LmNvbmNhdCh0aXRsZS5zcGxpdCgnICcpKVxuXHRcdGVsc2UgY29uc29sZS5sb2coJ1VuZGVmaW5lZCB0aXRsZSBhdCAnICsgaW5kZXgpXG5cdH0pO1xuXG5cdHJldHVybiB3b3JkQXJyYXk7XG59XG5cbi8vIGZ1bmN0aW9uIGdlblBkZkRvYygpIHtcbi8vIFx0dmFyICRzdmcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc3ZnLXBvcnQnKVxuLy8gXHRcdCwgZG9jID0gbmV3IFBERkRvY3VtZW50KHtcbi8vIFx0XHRsYXlvdXQ6ICdsYW5kc2NhcGUnXG4vLyBcdH0pXG4vLyBcdFx0LCBzdHJlYW0gPSBkb2MucGlwZShibG9iU3RyZWFtKCkpO1xuLy8gXHRkb2MuZm9udFNpemUoMjUpXG4vLyBcdFx0LnRleHQoJ0NobXVyYSBzbG93IGtsdWN6b3d5Y2gnLCAxMDAsIDQwKTtcbi8vIFx0ZG9jLmZvbnRTaXplKDEyKVxuLy8gXHRcdC50ZXh0KCdXeWdlbmVyb3dhbm8gcHJ6ZXogJywge1xuLy8gXHRcdFx0Y29udGludWVkOiB0cnVlXG4vLyBcdFx0fSlcbi8vIFx0XHQudGV4dCgnV2l6dWFsaXphdG9yIERvcm9ia3UgTmF1a293ZWdvJywge1xuLy8gXHRcdFx0Y29udGludWVkOiB0cnVlLFxuLy8gXHRcdFx0bGluazogJ2h0dHA6Ly92aXN1YWxpemVtZS51bWsucGwnXG4vLyBcdFx0fSlcbi8vIFx0XHQudGV4dCgnIGRsYSAnICsgYXV0aG9yTmFtZS5ub3JtYWxpemUoJ05GRCcpLnJlcGxhY2UoL1tcXHUwMzAwLVxcdTAzNmZdL2csIFwiXCIpKTtcbi8vXG4vL1xuLy8gXHR2YXIgc2NhbGUgPSBkb2MucGFnZS53aWR0aCAvICRzdmcud2lkdGguYmFzZVZhbC52YWx1ZTtcbi8vIFx0dmFyIHdpZHRoID0gJHN2Zy53aWR0aC5iYXNlVmFsLnZhbHVlO1xuLy8gXHR2YXIgaGVpZ2h0ID0gJHN2Zy5oZWlnaHQuYmFzZVZhbC52YWx1ZTtcbi8vIFx0Y29uc29sZS5sb2coc2NhbGUpO1xuLy8gLy8gICAgICAgICRzdmcgPSAkc3ZnLmNsb25lTm9kZSh0cnVlKTtcbi8vIFx0JHN2Zy5zZXRBdHRyaWJ1dGUoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgc2NhbGUgKyAnKScpO1xuLy9cbi8vIFx0U1ZHdG9QREYoZG9jLCAkc3ZnLCAxMDAsIDEwMCwge3dpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9KTtcbi8vXG4vL1xuLy9cbi8vXG4vL1xuLy8gXHRzdHJlYW0ub24oJ2ZpbmlzaCcsIGZ1bmN0aW9uKCkge1xuLy8gXHRcdGNvbnNvbGUubG9nKHN0cmVhbS50b0Jsb2JVUkwoJ2FwcGxpY2F0aW9uL3BkZicpKTtcbi8vIFx0XHR3aW5kb3cubG9jYXRpb24gPSBzdHJlYW0udG9CbG9iVVJMKCdhcHBsaWNhdGlvbi9wZGYnKTtcbi8vIFx0fSk7XG4vLyBcdGRvYy5lbmQoKTtcbi8vXG4vLyB9XG4iXSwic291cmNlUm9vdCI6IiJ9