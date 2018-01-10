

$(document).ready(function () {

	// var selectForm = $('#name-select-form');
	// selectForm.submit(function (event) {
	// 	event.preventDefault();
	// 	var trueName = $('label[for="' + $('input[type="radio"]:checked').attr("id") + '"]').text();
	// 	$('.vis-form-name-input').val(trueName);
	// })


	var DetailedDescriptions = {
		graph: jsStrings.vis_details.collab,
		works: jsStrings.vis_details.works,
		bubbles: jsStrings.vis_details.bubbles,
		map: jsStrings.vis_details["google-map"],
		wordcloud: jsStrings.vis_details.wordcloud,
		circle: jsStrings.vis_details["research-map"]
	};

	DisplayDetails = function (visName) {
		$('#details-host').text(DetailedDescriptions[visName])
	}
});

var inputFocused = false;
var wasChangedControlValue = 0;

function SetInputFocused() {
	inputFocused = true;
}
function SetInputBlurred() {
	inputFocused = false;
}

function InputChanged() {
	wasChangedControlValue++;
	var thisId = wasChangedControlValue;
	setTimeout(function () {
		if (wasChangedControlValue == thisId) {
			QueryForSuggestions()
			wasChangedControlValue = 0;
		}
	}, 1500)
}

var DisplayDetails;

// function QueryForSuggestions() {
// 	var autocompletedInput = $('#name-and-surname-autocomplete');
// 	var queryName = autocompletedInput.val();
// 	console.log(queryName);
//
// 	$.ajax('/name-lookup', {
// 		data: {
// 			name: queryName
// 		}
// 	}).done(function (queryResults) {
// 		console.log(queryResults);
//
// 		function getLi(content) {
// 			return '<li onclick="SetChosenResult(this)" class="dropdown-namelist-item"><span>' + content + ' </span> </li >'
// 		}
//
// 		var $results = $('#results');
// 		queryResults.forEach(function (result) {
// 			$results.append(getLi(result))
// 		})
//
// 	});
// }