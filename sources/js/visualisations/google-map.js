import {InjectContext} from "../common";

var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 52.23, lng: 20.92},
		zoom: 3
	});
}
document.addEventListener('DOMContentLoaded', () => InjectContext((works, strings) => {
	initMap();
	works = works.filter(function (work) {
		return !!work.latLng
	})
	var maxSize = 200;
	var minSize = 20;
	var maxAmount = works.length;
	var calc = function(markers) {
		var size = (markers.length / maxAmount) * maxSize;
		if(size < minSize) size = minSize;
		return {width: size, height: size};
	}
	let markers = [];

	var titles = {};
	works.forEach(function (workObject, index) {
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
	google.maps.event.addListener(markerCluster, "click", function (c) {
		console.log('event fired');
		var clusteredTitles = '<div><b> Opublikowano tutaj: </b> <br/>';
		var m = c.getMarkers();
		for (var i = 0; i < m.length; i++ ) clusteredTitles = (clusteredTitles + (titles[m[i].titleKey] + '<br/>'));
		var infowindow = new google.maps.InfoWindow({
			content: clusteredTitles,
			position: c.getCenter()
		});
		infowindow.open(map);
	})
}));

