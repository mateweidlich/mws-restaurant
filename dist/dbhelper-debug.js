/**
 * Common database helper functions.
 */
class DBHelper {
	/**
	 * Database URL.
	 * Change this to restaurants.json file location on your server.
	 */
	static get DATABASE_URL() {
		const port = 8000;
		return `http://localhost:${port}/data/restaurants.json`;
	}

	/**
	 * Fetch all restaurants.
	 */
	fetchRestaurants(callback) {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', DBHelper.DATABASE_URL);
		xhr.onload = () => {
			if (xhr.status === 200) { // Got a success response from server!
				const json = JSON.parse(xhr.responseText);
				const restaurants = json.restaurants;
				callback(null, restaurants);
			} else { // Oops!. Got an error from server.
				callback(`Request failed. Returned status of ${xhr.status}`, null);
			}
		};
		xhr.send();
	}

	/**
	 * Fetch a restaurant by its ID.
	 */
	fetchRestaurantById(id, callback) {
		// fetch all restaurants with proper error handling.
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				const restaurant = restaurants.find(r => r.id == id);
				if (restaurant) { // Got the restaurant
					callback(null, restaurant);
				} else { // Restaurant does not exist in the database
					callback('Restaurant does not exist', null);
				}
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine type with proper error handling.
	 */
	fetchRestaurantByCuisine(cuisine, callback) {
		// Fetch all restaurants  with proper error handling
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given cuisine type
				const results = restaurants.filter(r => r.cuisine_type == cuisine);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a neighborhood with proper error handling.
	 */
	fetchRestaurantByNeighborhood(neighborhood, callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Filter restaurants to have only given neighborhood
				const results = restaurants.filter(r => r.neighborhood == neighborhood);
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				let results = restaurants;
				if (cuisine != 'all') { // filter by cuisine
					results = results.filter(r => r.cuisine_type == cuisine);
				}
				if (neighborhood != 'all') { // filter by neighborhood
					results = results.filter(r => r.neighborhood == neighborhood);
				}
				callback(null, results);
			}
		});
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	fetchNeighborhoods(callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
				callback(null, uniqueNeighborhoods);
			}
		});
	}

	/**
	 * Fetch all cuisines with proper error handling.
	 */
	fetchCuisines(callback) {
		// Fetch all restaurants
		this.fetchRestaurants((error, restaurants) => {
			if (error) {
				callback(error, null);
			} else {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
				callback(null, uniqueCuisines);
			}
		});
	}

	/**
	 * Restaurant page URL.
	 */
	urlForRestaurant(restaurant) {
		return (`./restaurant.html?id=${restaurant.id}`);
	}

	/**
	 * Restaurant image URL.
	 */
	imageUrlForRestaurant(restaurant) {
		return (`/img/${restaurant.photograph}`);
	}

	/**
	 * Restaurant image srcset
	 */
	imageSrcsetForRestaurant(restaurant, ext) {
		const imgName = restaurant.photograph.replace('.jpg', '');
		return (`/img/${imgName}_200.${ext} 200w, /img/${imgName}_300.${ext} 300w, /img/${imgName}_400.${ext} 400w, /img/${imgName}.${ext} 800w`);
	}

	/**
	 * Restaurant <picture> element
	 */
	pictureForRestaurant(element, restaurant, sizes) {
		const webpSource = document.createElement('source');
		webpSource.srcset = this.imageSrcsetForRestaurant(restaurant, 'webp');
		webpSource.sizes = sizes;
		webpSource.type = 'image/webp';
		element.append(webpSource);

		const image = document.createElement('img');
		image.src = this.imageUrlForRestaurant(restaurant, 'jpg');
		image.srcset = this.imageSrcsetForRestaurant(restaurant, 'jpg');
		image.sizes = sizes;
		image.width = 800;
		image.alt = `${restaurant.name} located in ${restaurant.neighborhood}`;
		image.className = 'restaurant-img';
		element.append(image);

		return element;
	}

	/**
	 * Map marker for a restaurant.
	 */
	mapMarkerForRestaurant(restaurant) {
		const marker = new google.maps.Marker({
			position: restaurant.latlng,
			title: restaurant.name,
			url: this.urlForRestaurant(restaurant),
			map: window.map,
			animation: google.maps.Animation.DROP
		});
		return marker;
	}

	/**
	 * Rating average for a restaurant.
	 */
	ratingAverageForRestaurant(restaurant) {
		let count = 0,
			sum = 0;

		if (restaurant.reviews) {
			restaurant.reviews.forEach(review => {
				if (review.rating) {
					++count;
					sum += review.rating;
				}
			});
		}

		return (count > 0 ? (Math.round((sum / count) * 2) / 2) : 0);
	}

	/**
	 * Rating html for a restaurant.
	 */
	ratingHtmlForRestaurant(rating) {
		let ratingHtml = '';

		for (let i = 1; i < 6; ++i) {
			if (rating >= i) {
				ratingHtml += '🌑';
			} else if (rating + 0.5 == i) {
				ratingHtml += '🌓';
			} else {
				ratingHtml += '🌕';
			}
		}

		return ratingHtml;
	}
}

window.dbhelper = new DBHelper();