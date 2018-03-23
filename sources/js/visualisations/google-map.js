var map;
function initMap() {
	$(document).ready(function () {
		map = new google.maps.Map('svg', {
			center: {lat: 52.23, lng: 20.92},
			zoom: 3
		});
	})

}

var clustererStyles = [ {
	url: 'http://i.imgur.com/1Egeyzw.png',
	height: 53,
	width: 53,
	textSize: 10
}, {
	url: 'http://i.imgur.com/eGZu1Qe.png',
	height: 70,
	width: 70,
	textSize: 11
}, {
	url: 'http://i.imgur.com/Xnk702C.png',
	height: 100,
	width: 100,
	textSize: 12
}, {
	url: 'http://i.imgur.com/XjQONEB.png',
	height: 130,
	width: 130,
	textSize: 30
}, {
	url:'http://i.imgur.com/cpeTCOH.png',
	height: 180,
	width: 180,
	textSize: 50
} ];
//
//    for(var i=0; i<20; i++) {
//        var size = i * 5 + 30;
//        clustererStyles.push({
//            url: 'http://i.imgur.com/SlsBy7L.png',
//            height: size,
//            width: size,
//            anchor: [16, 0],
//            textSize: size / 3
//        })
//    }

$(document).ready(function () {
	$.post("google-map", {}, function (data) {
		console.log(data)

		console.log('posted for data')
		var maxSize = 200;
		var minSize = 20;
		var maxAmount = data.length;
		var calc = function(markers) {
			var size = (markers.length / maxAmount) * maxSize;
			if(size < minSize) size = minSize;
			return {width: size, height: size};
		}

		var markers = [];
//            data.forEach(function (datum) {
//                console.log(datum.potentialCity)
//                //for(var prop in datum) if(datum.hasOwnProperty(prop)) console.log(prop);
//            })
		var titles = {};
		data.forEach(function(workObject, index){
			if(typeof workObject.lat != 'number') return;
		titles[index] = workObject.title;
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(workObject.latLng.lat, workObject.latLng.lng),
			map: map,
			clickable: false,
			titleKey: index
		})
		markers.push(marker);
		markers[markers.length - 1].setClickable(false);


	});

		var markerCluster = new MarkerClusterer(map, markers, {
			averageCenter: true,
			zoomOnClick: false,
			minimumClusterSize: 1
		});
		//markerCluster.setCalculator(calc)

		google.maps.event.addListener(markerCluster, "click", function (c) {
			console.log('event fired');
			var clusteredTitles = '<div><b> Opublikowano tutaj: </b> <br/>'
			var m = c.getMarkers();
			for (var i = 0; i < m.length; i++ ) clusteredTitles = (clusteredTitles + (titles[m[i].titleKey] + '<br/>'))

			var infowindow = new google.maps.InfoWindow({
				content: clusteredTitles,
				position: c.getCenter()
			});
			infowindow.open(map);
		})



	});


})


