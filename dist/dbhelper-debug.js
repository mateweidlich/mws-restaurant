/**
 * Common database helper functions.
 */
class DBHelper {
	/**
	 * Fetch a restaurant by its ID.
	 */
	fetchRestaurantById(id, callback) {
		window.idb.openDb().then(() => {
			window.idb.getById(id).then((restaurant) => {
				callback(null, restaurant);
			});
		}).catch((error) => {
			callback(error, null);
		});
	}

	/**
	 * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
	 */
	fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
		window.idb.openDb().then(() => {
			if (neighborhood == 'all' && cuisine == 'all') {
				window.idb.getAll().then((restaurants) => {
					callback(null, restaurants);
				});
			} else {
				let index = [];
				let value = [];

				if (neighborhood != 'all') {
					index.push('neighborhood');
					value.push(neighborhood);
				}

				if (cuisine != 'all') {
					index.push('cuisine_type');
					value.push(cuisine);
				}

				if (value.length == 1) {
					value = value.join('');
				}

				window.idb.getByIndex(index.join('_'), value).then((restaurant) => {
					callback(null, restaurant);
				});
			}
		}).catch((error) => {
			callback(error, null);
		});
	}

	/**
	 * Fetch all neighborhoods with proper error handling.
	 */
	fetchNeighborhoods(callback) {
		window.idb.openDb().then(() => {
			window.idb.getAll().then((restaurants) => {
				// Get all neighborhoods from all restaurants
				const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
				// Remove duplicates from neighborhoods
				const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
				callback(null, uniqueNeighborhoods);
			});
		}).catch((error) => {
			callback(error, null);
		});
	}

	/**
	 * Fetch all cuisines with proper error handling.
	 */
	fetchCuisines(callback) {
		window.idb.openDb().then(() => {
			window.idb.getAll().then((restaurants) => {
				// Get all cuisines from all restaurants
				const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
				// Remove duplicates from cuisines
				const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
				callback(null, uniqueCuisines);
			});
		}).catch((error) => {
			callback(error, null);
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
		if (!restaurant.photograph) {
			restaurant.photograph = 'noimg.jpg';
		}		
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
	 * Rating html for a restaurant.
	 */
	ratingHtmlForRestaurant(rating) {
		let ratingHtml = '';

		for (let i = 1; i < 6; ++i) {
			if (rating >= i) {
				ratingHtml += '★';
			} else {
				ratingHtml += '☆';
			}
		}

		return ratingHtml;
	}
}

window.dbhelper = new DBHelper();