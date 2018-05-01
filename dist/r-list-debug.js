window.map = null;
window.markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
window.addEventListener('load', () => {
	restaurantList.fetchNeighborhoods();
	restaurantList.fetchCuisines();
	restaurantList.updateRestaurants();

	document.getElementById('neighborhoods-select').addEventListener('change', restaurantList.updateRestaurants);
	document.getElementById('cuisines-select').addEventListener('change', restaurantList.updateRestaurants);
});

/**
 * Initialize Google map
 */
window.initMap = () => {
	window.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: {
			lat: 40.722216,
			lng: -73.987501
		},
		scrollwheel: false
	});
	restaurantList.addMarkersToMap();
	document.getElementById('map').removeEventListener('click', window.initMap);
};

class RestaurantList {
	constructor() {
		this.restaurants = null;
		this.neighborhoods = null;
		this.cuisines = null;
	}

	/**
	 * Fetch all neighborhoods and set their HTML.
	 */
	fetchNeighborhoods() {
		window.dbhelper.fetchNeighborhoods((error, neighborhoods) => {
			if (error) { // Got an error
				console.error(error);
			} else {
				this.neighborhoods = neighborhoods;
				this.fillNeighborhoodsHTML();
			}
		});
	}

	/**
	 * Set neighborhoods HTML.
	 */
	fillNeighborhoodsHTML() {
		const select = document.getElementById('neighborhoods-select');

		this.neighborhoods.forEach(neighborhood => {
			const option = document.createElement('option');
			option.innerHTML = neighborhood;
			option.value = neighborhood;
			select.append(option);
		});
	}

	/**
	 * Fetch all cuisines and set their HTML.
	 */
	fetchCuisines() {
		window.dbhelper.fetchCuisines((error, cuisines) => {
			if (error) { // Got an error!
				console.error(error);
			} else {
				this.cuisines = cuisines;
				this.fillCuisinesHTML();
			}
		});
	}

	/**
	 * Set cuisines HTML.
	 */
	fillCuisinesHTML() {
		const select = document.getElementById('cuisines-select');

		this.cuisines.forEach(cuisine => {
			const option = document.createElement('option');
			option.innerHTML = cuisine;
			option.value = cuisine;
			select.append(option);
		});
	}

	/**
	 * Update page and map for current restaurants.
	 */
	updateRestaurants() {
		const cSelect = document.getElementById('cuisines-select');
		const nSelect = document.getElementById('neighborhoods-select');

		const cIndex = cSelect.selectedIndex;
		const nIndex = nSelect.selectedIndex;

		const cuisine = cSelect[cIndex].value;
		const neighborhood = nSelect[nIndex].value;

		window.dbhelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
			if (error) { // Got an error!
				console.error(error);
			} else {
				restaurantList.resetRestaurants(restaurants);
				restaurantList.fillRestaurantsHTML();
				if (window.map !== null) {
					restaurantList.addMarkersToMap();
				}
			}
			window.loaded = true;
		});
	}

	/**
	 * Clear current restaurants, their HTML and remove their map markers.
	 */
	resetRestaurants(restaurants) {
		// Remove all restaurants
		this.restaurants = [];
		const ul = document.getElementById('restaurants-list');
		ul.innerHTML = '';

		// Remove all map markers
		if (window.markers.length > 0) {
			window.markers.forEach(m => m.setMap(null));
		}
		window.markers = [];
		this.restaurants = restaurants;
	}

	/**
	 * Create all restaurants HTML and add them to the webpage.
	 */
	fillRestaurantsHTML() {
		const ul = document.getElementById('restaurants-list');
		if (this.restaurants.length > 0) {
			this.restaurants.forEach(restaurant => {
				ul.append(this.createRestaurantHTML(restaurant));
			});
		} else {
			const notFound = document.createElement('p');
			notFound.innerHTML = 'No restaurants found with the selected filters.';
			ul.append(notFound);
		}
		window.setTabindex();
	}

	/**
	 * Create restaurant HTML.
	 */
	createRestaurantHTML(restaurant) {
		const li = document.createElement('li');
		li.id = 'rr_' + restaurant.id;

		const fav = document.createElement('div');
		fav.id = 'fav_' + restaurant.id;
		fav.className = 'restaurant-fav';
		const favSpan = document.createElement('span');
		favSpan.setAttribute('aria-label', 'Mark as favorite');
		const isFav = (restaurant.is_favorite === 'true' || restaurant.is_favorite === true);
		if (isFav) {
			favSpan.className = 'is_fav';
		}
		favSpan.innerHTML = (isFav) ? '★' : '☆';
		favSpan.addEventListener('click', (event) => {
			const isFav = event.target.classList.contains('is_fav');
			window.idb.setFavoriteById(restaurant.id, !isFav).then(() => {
				if (isFav) {
					event.target.classList.remove('is_fav');
					event.target.innerHTML = '☆';
				} else {
					event.target.classList.add('is_fav');
					event.target.innerHTML = '★';
				}
			});
		});
		fav.append(favSpan);
		li.append(fav);

		window.loadAfterReady.push(() => {
			const image = window.dbhelper.pictureForRestaurant(
				document.createElement('picture'),
				restaurant,
				'(max-width: 575px) 71.8vw, (max-width: 767px) 40.071vw, (max-width: 991px) 36.944vw, 23.316vw'
			);
			document.getElementById('rr_' + restaurant.id).insertBefore(image, document.getElementById('fav_' + restaurant.id));
		});

		const div = document.createElement('div');
		div.className = 'restaurant-data';

		const name = document.createElement('h2');
		name.innerHTML = restaurant.name;
		div.append(name);

		const neighborhood = document.createElement('p');
		neighborhood.innerHTML = restaurant.neighborhood;
		div.append(neighborhood);

		const address = document.createElement('p');
		address.innerHTML = restaurant.address;
		div.append(address);

		li.append(div);

		const more = document.createElement('a');
		more.innerHTML = 'View Details';
		more.href = window.dbhelper.urlForRestaurant(restaurant);
		li.append(more);

		return li;
	}

	/**
	 * Add markers for current restaurants to the map.
	 */
	addMarkersToMap() {
		this.restaurants.forEach(restaurant => {
			// Add marker to the map
			const marker = window.dbhelper.mapMarkerForRestaurant(restaurant, self.map);
			google.maps.event.addListener(marker, 'click', () => {
				window.location.href = marker.url;
			});
			window.markers.push(marker);
		});
	}
}

const restaurantList = new RestaurantList();