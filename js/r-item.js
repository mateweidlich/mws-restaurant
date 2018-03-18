let restaurant;
var map;

/**
 * Initialize Google map
 */
window.addEventListener('load', (event) => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			setTabindex();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
		}
	});
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant)
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		error = 'No restaurant id in URL'
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			callback(null, restaurant)
		});
	}
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;

	DBHelper.pictureForRestaurant(
		document.getElementById('restaurant-img'),
		restaurant,
		'(max-width: 575px) 87.338vw, (max-width: 767px) 54.542vw, (max-width: 991px) 36.132vw, 36.835vw'
	);
	//document.getElementById('restaurant-img').replace(image);
	
	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;

	const rating = document.getElementById('restaurant-rating');
	rating.innerHTML = DBHelper.ratingHtmlForRestaurant(DBHelper.ratingAverageForRestaurant(restaurant));

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews
	fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h2');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
	const li = document.createElement('li');

	const div = document.createElement('div');
	const name = document.createElement('p');
	name.className = 'reviewer-name';
	name.innerHTML = review.name;
	div.appendChild(name);

	const innerDiv = document.createElement('div');
	const date = document.createElement('p');
	date.className = 'reviewer-date';
	date.innerHTML = review.date;
	innerDiv.appendChild(date);

	const rating = document.createElement('p');
	rating.className = 'reviewer-rating';
	rating.setAttribute('aria-label', 'Rating: ' + review.rating + ' of 5');
	rating.innerHTML = DBHelper.ratingHtmlForRestaurant(review.rating);

	innerDiv.appendChild(rating);

	div.appendChild(innerDiv);
	li.appendChild(div);

	const comments = document.createElement('p');
	comments.className = 'reviewer-comment';
	comments.innerHTML = review.comments;
	li.appendChild(comments);

	return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
	if (!url)
		url = window.location.href;
	name = name.replace(/[\[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}