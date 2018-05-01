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

		const favSpan = document.getElementById('restaurant-fav-span');
		const isFav = (this.item.is_favorite === 'true' || this.item.is_favorite === true);
		if (isFav) {
			favSpan.className = 'is_fav';
		}
		favSpan.innerHTML = (isFav) ? '★' : '☆';
		favSpan.addEventListener('click', (event) => {
			const isFav = event.target.classList.contains('is_fav');
			window.idb.setFavoriteById(this.item.id, !isFav).then(() => {
				if (isFav) {
					event.target.classList.remove('is_fav');
					event.target.innerHTML = '☆';
				} else {
					event.target.classList.add('is_fav');
					event.target.innerHTML = '★';
				}
			});
		});

		window.dbhelper.pictureForRestaurant(
			document.getElementById('restaurant-img'),
			this.item,
			'(max-width: 575px) 87.338vw, (max-width: 767px) 54.542vw, (max-width: 991px) 36.132vw, 36.835vw'
		);

		const cuisine = document.getElementById('restaurant-cuisine');
		cuisine.innerHTML = this.item.cuisine_type;

		const address = document.getElementById('restaurant-address');
		address.innerHTML = this.item.address;

		// fill operating hours
		if (this.item.operating_hours) {
			this.fillRestaurantHoursHTML();
		}
		// fill reviews
		this.fillReviewsHTML();

		document.getElementById('review-form-send').addEventListener('click', () => {
			const ul = document.getElementById('reviews-list');
			window.reviewIdb.sendReview({
				restaurant_id: this.item.id,
				name: document.getElementById('review-name').value,
				rating: document.getElementById('review-rating').value,
				comments: document.getElementById('review-text').value
			}).then((json) => {
				document.getElementById('review-form').reset();
				ul.appendChild(this.createReviewHTML(json));
			}).catch((json) => {
				document.getElementById('review-form').reset();
				json.updatedAt = Date.now();
				ul.appendChild(this.createReviewHTML(json));
			});
		});
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

		window.reviewIdb.getReviewByIndex('restaurant_id', this.item.id).then((reviews) => {
			const ul = document.getElementById('reviews-list');
			reviews.forEach(review => {
				ul.appendChild(this.createReviewHTML(review));
			});
		}).catch(() => {
			const noReviews = document.createElement('p');
			noReviews.innerHTML = 'No reviews yet!';
			container.appendChild(noReviews);
		});
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
		const t = new Date(review.updatedAt);
		const leadingZero = (num) => {
			return ('0' + num).slice(-2);
		};
		date.innerHTML = `${t.getFullYear()}.${leadingZero(t.getMonth() + 1)}.${leadingZero(t.getDate())}. ${leadingZero(t.getHours())}:${leadingZero(t.getMinutes())}`;
		innerDiv.appendChild(date);

		const rating = document.createElement('p');
		rating.className = 'reviewer-rating';
		rating.setAttribute('aria-label', 'Rating: ' + review.rating + ' of 5');
		rating.innerHTML = window.dbhelper.ratingHtmlForRestaurant(review.rating, true);

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