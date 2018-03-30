window.map = null;

window.addEventListener('load', () => {
	restaurant.fetch((error) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			restaurant.fillBreadcrumb();
			window.setTabindex();
		}
	});
});

/**
 * Initialize Google map
 */
window.initMap = () => {
	window.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: restaurant.item.latlng,
		scrollwheel: false
	});
	window.dbhelper.mapMarkerForRestaurant(restaurant.item);
	document.getElementById('map').removeEventListener('click', window.initMap);
};

class Restaurant {
	constructor() {
		this.item = null;
	}

	/**
	 * Get current restaurant from page URL.
	 */
	fetch(callback) {
		if (this.item) { // restaurant already fetched!
			callback(null);
			return;
		}
		const id = window.getParameterByName('id');
		if (!id) { // no id found in URL
			callback('No restaurant id in URL');
		} else {
			window.dbhelper.fetchRestaurantById(id, (error, item) => {
				this.item = item;
				if (!this.item) {
					console.error(error);
					return;
				}
				this.fillRestaurantHTML();
				callback(null);
			});
		}
	}

	/**
	 * Create restaurant HTML and add it to the webpage
	 */
	fillRestaurantHTML() {
		const name = document.getElementById('restaurant-name');
		name.innerHTML = this.item.name;

		window.dbhelper.pictureForRestaurant(
			document.getElementById('restaurant-img'),
			this.item,
			'(max-width: 575px) 87.338vw, (max-width: 767px) 54.542vw, (max-width: 991px) 36.132vw, 36.835vw'
		);

		const cuisine = document.getElementById('restaurant-cuisine');
		cuisine.innerHTML = this.item.cuisine_type;

		const address = document.getElementById('restaurant-address');
		address.innerHTML = this.item.address;

		const rating = document.getElementById('restaurant-rating');
		rating.innerHTML = window.dbhelper.ratingHtmlForRestaurant(window.dbhelper.ratingAverageForRestaurant(this.item));

		// fill operating hours
		if (this.item.operating_hours) {
			this.fillRestaurantHoursHTML();
		}
		// fill reviews
		this.fillReviewsHTML();
	}

	/**
	 * Create restaurant operating hours HTML table and add it to the webpage.
	 */
	fillRestaurantHoursHTML() {
		const hours = document.getElementById('restaurant-hours');

		for (let key in this.item.operating_hours) {
			const row = document.createElement('tr');

			const day = document.createElement('td');
			day.innerHTML = key;
			row.appendChild(day);

			const time = document.createElement('td');
			time.innerHTML = this.item.operating_hours[key];
			row.appendChild(time);

			hours.appendChild(row);
		}
	}

	/**
	 * Create all reviews HTML and add them to the webpage.
	 */
	fillReviewsHTML() {
		const container = document.getElementById('reviews-container');
		const title = document.createElement('h3');
		title.innerHTML = 'Reviews';
		container.appendChild(title);

		if (!this.item.reviews) {
			const noReviews = document.createElement('p');
			noReviews.innerHTML = 'No reviews yet!';
			container.appendChild(noReviews);
			return;
		}

		const ul = document.getElementById('reviews-list');
		this.item.reviews.forEach(review => {
			ul.appendChild(this.createReviewHTML(review));
		});

		container.appendChild(ul);
	}

	/**
	 * Create review HTML and add it to the webpage.
	 */
	createReviewHTML(review) {
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
		rating.innerHTML = window.dbhelper.ratingHtmlForRestaurant(review.rating);

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
	fillBreadcrumb() {
		const breadcrumb = document.getElementById('breadcrumb');
		const li = document.createElement('li');
		li.innerHTML = this.item.name;
		li.setAttribute('aria-current', 'page');
		breadcrumb.appendChild(li);
	}
}

const restaurant = new Restaurant();