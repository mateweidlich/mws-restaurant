const staticCacheName = 'restaurant-reviews-v1';
const imagesCacheName = 'restaurant-reviews-photos-v1';

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(staticCacheName)
			.then(cache => {
				cache.addAll([
					'index.html',
					'restaurant.html',
					'data/restaurants.json',
					'js/dbhelper.js',
					'js/main.js',
					'js/r-list.js',
					'js/r-item.js',
					'css/main.css',
					'css/r-list.css',
					'css/r-item.css',
					'css/mquery.css'
				]);
			})
	);
});

self.addEventListener('fetch', event => {
	const requestUrl = new URL(event.request.url);

	if (requestUrl.origin === location.origin) {
		if (requestUrl.pathname === '/') {
			event.respondWith(
				caches.match('index.html')
					.then(response => response || fetch(event.request))
			);
			return;
		}

		if (requestUrl.pathname.startsWith('/restaurant.html')) {
			event.respondWith(
				caches.match('restaurant.html')
					.then(response => response || fetch(event.request))
			);
			return;
		}

		if (requestUrl.pathname.startsWith('/img/')) {
			event.respondWith(servePhoto(event.request));
			return;
		}
	}

	event.respondWith(
		caches.match(event.request)
			.then(response => response || fetch(event.request))
	);
});

const servePhoto = (request) => {
	return caches.open(imagesCacheName).then(cache => {
		return cache.match(request).then(response => {
			if (response) {
				return response;
			}

			return fetch(request).then(networkResponse => {
				cache.put(request, networkResponse.clone());
				return networkResponse;
			});
		});
	});
};