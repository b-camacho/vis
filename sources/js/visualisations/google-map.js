import {InjectContext} from "../common";

let map;
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
	const maxSize = 200;
	const minSize = 20;
	const maxAmount = works.length;
	const calc = function(markers) {
		let size = (markers.length / maxAmount) * maxSize;
		if(size < minSize) size = minSize;
		return {width: size, height: size};
	}
	const markers = [];

	const titles = {};
	works.forEach(function (workObject, index) {
		titles[index] = workObject.title;
		const marker = new google.maps.Marker({
			position: new google.maps.LatLng(workObject.latLng.lat, workObject.latLng.lng),
			map: map,
			clickable: false,
			titleKey: index
		})
		markers.push(marker);
		markers[markers.length - 1].setClickable(false);
	});
	const markerCluster = new MarkerClusterer(map, markers, {
		averageCenter: true,
		zoomOnClick: false,
		minimumClusterSize: 1
	});
	google.maps.event.addListener(markerCluster, "click", function (c) {
		const clusteredTitles = '<div><b> Opublikowano tutaj: </b> <br/>';
		const m = c.getMarkers();
		for (let i = 0; i < m.length; i++ ) clusteredTitles = (clusteredTitles + (titles[m[i].titleKey] + '<br/>'));
		const infowindow = new google.maps.InfoWindow({
			content: clusteredTitles,
			position: c.getCenter()
		});
		infowindow.open(map);
	})
}));

