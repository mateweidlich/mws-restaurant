const staticCacheName = 'restaurant-reviews-v2';
const imagesCacheName = 'restaurant-reviews-photos-v2';

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open(staticCacheName).then(cache => {
			cache.addAll([
				'index.html',
				'restaurant.html',
				'dist/idb.js',
				'dist/dbhelper.js',
				'dist/main.js',
				'dist/r-list.js',
				'dist/r-item.js',
				'css/index.min.css',
				'css/restaurant.min.css',
				'manifest.json',
				'favicon.ico'
			]);
		})
	);
});

self.addEventListener('fetch', event => {
	const requestUrl = new URL(event.request.url);
	if (requestUrl.origin === location.origin) {
		if (requestUrl.pathname === '/') {
			event.respondWith(
				caches.match('index.html').then(response => response || fetch(event.request))
			);
			return;
		}

		if (requestUrl.pathname.startsWith('/restaurant.html')) {
			event.respondWith(
				caches.match('restaurant.html').then(response => response || fetch(event.request))
			);
			return;
		}

		if (requestUrl.pathname.startsWith('/img/')) {
			event.respondWith(serveFile(imagesCacheName, event.request));
			return;
		}
	}

	event.respondWith(
		caches.match(event.request).then(response => response || fetch(event.request).catch())
	);
});

const serveFile = (cacheName, request) => {
	return caches.open(cacheName).then(cache => {
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