window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

class Idb {
	constructor(dbName, version) {
		this.jsonUrl = 'http://localhost:1337/';
		this.dbName = dbName;
		this.dbVersion = version;
		this.idb = null;
		this.db = null;
		this.openDb().then(() => {
			if (this.dbName === 'rr-restaurants') {
				this.fillDb();
			}
		});
	}

	/**
	 * Open IndexedDB database
	 */
	openDb() {
		return new Promise((resolve, reject) => {
			this.idb = window.indexedDB.open(this.dbName, this.dbVersion);
			this.idb.onsuccess = (event) => {
				this.db = event.target.result;
				resolve();
			};
			this.idb.onerror = (event) => {
				console.error('openDb: ', event.target.errorCode);
				reject();
			};
			this.idb.onupgradeneeded = (event) => {
				const options = {
					keyPath: 'id'
				};
				if (this.dbName === 'rr-offline') {
					options.autoIncrement = true;
				}
				const store = event.target.result.createObjectStore(this.dbName, options);

				if (this.dbName === 'rr-restaurants') {
					store.createIndex('neighborhood', 'neighborhood');
					store.createIndex('cuisine_type', 'cuisine_type');
					store.createIndex('neighborhood_cuisine_type', ['neighborhood', 'cuisine_type']);
				} else if (this.dbName === 'rr-reviews') {
					store.createIndex('restaurant_id', 'restaurant_id');
				}
			};
		});
	}

	/**
	 * Get readonly objectstore
	 */
	getDbR() {
		return this.db.transaction(this.dbName).objectStore(this.dbName);
	}

	/**
	 * Get readwrite objectstore
	 */
	getDbRW() {
		return this.db.transaction(this.dbName, 'readwrite').objectStore(this.dbName);
	}

	/**
	 * Get object from store by ID
	 */
	getAll() {
		return new Promise((resolve, reject) => {
			const request = this.getDbR().getAll();
			request.onsuccess = () => {
				resolve(request.result);
			};
			request.onerror = () => {
				reject('Error getAll');
			};
		});
	}

	/**
	 * Get object from store by ID
	 */
	getById(id) {
		return new Promise((resolve, reject) => {
			const request = this.getDbR().get(parseInt(id));
			request.onsuccess = () => {
				resolve(request.result);
			};
			request.onerror = () => {
				reject('Error getById');
			};
		});
	}

	/**
	 * Send review
	 */
	sendReview(review) {
		return new Promise((resolve, reject) => {
			fetch(`${this.jsonUrl}reviews/`, {
				method: 'POST',
				body: JSON.stringify(review),
				headers: {
					'content-type': 'application/json'
				}
			}).then(response => response.json()).then((json) => {
				this.getDbRW().put(json);
				resolve(json);
			}).catch(() => {
				review.type = 'review';
				window.offlineIdb.getDbRW().put(review);
				review.id = Date.now();
				this.getDbRW().put(review);
				reject(review);
			});
		});
	}

	/**
	 * Set favorite restaurant by its ID.
	 */
	setFavoriteById(id, isFav = true) {
		return new Promise((resolve, reject) => {
			this.getById(id).then((restaurant) => {
				restaurant.is_favorite = isFav;
				this.getDbRW().put(restaurant);

				fetch(`${this.jsonUrl}restaurants/${id}/?is_favorite=${isFav.toString()}`, {
					method: 'PUT'
				}).then(() => {
					resolve();
				}).catch(() => {
					const request = window.offlineIdb.getDbRW().put({
						type: 'favorite',
						restaurant_id: id,
						is_favorite: isFav
					});
					request.onsuccess = () => {
						resolve();
					};
					request.onerror = () => {
						reject();
					};
				});
			}).catch(() => {
				reject();
			});
		});
	}

	/**
	 * Get objects from store by Index
	 */
	getByIndex(index, value) {
		return new Promise((resolve, reject) => {
			const request = this.getDbR().index(index).getAll(value);
			request.onsuccess = () => {
				resolve(request.result);
			};
			request.onerror = () => {
				reject('Error getByIndex');
			};
		});
	}

	/**
	 * Get objects from store by Index
	 */
	getReviewByIndex(index, value) {
		return new Promise((resolve, reject) => {
			fetch(`${this.jsonUrl}reviews/?restaurant_id=${value}`)
				.then((response) => response.json())
				.then((json) => {
					if (json.length > 0) {
						const dbRw = this.getDbRW();
						json.forEach(element => {
							dbRw.put(element);
						});
						resolve(json);
					} else {
						reject('Error getReviewByIndex');
					}
				}).catch(() => {
					const request = this.getDbR().index(index).getAll(value);
					request.onsuccess = () => {
						if (request.result.length > 0) {
							resolve(request.result);
						}
					};
					request.onerror = () => {
						reject();
					};
				});
		});
	}

	/**
	 * Fill database from json
	 */
	fillDb() {
		fetch(`${this.jsonUrl}restaurants`)
			.then((response) => response.json())
			.then((json) => {
				if (json.length > 0) {
					const dbRw = this.getDbRW();
					json.forEach(element => {
						dbRw.put(element);
					});
				}
			});
	}
}

window.idb = new Idb('rr-restaurants', 1);
window.reviewIdb = new Idb('rr-reviews', 1);
window.offlineIdb = new Idb('rr-offline', 1);

window.offlineUpdate = window.setInterval(() => {
	window.offlineIdb.getAll().then((items) => {
		items.forEach(item => {
			if (item.type === 'review') {
				fetch(`${window.offlineIdb.jsonUrl}reviews/`, {
					method: 'POST',
					body: JSON.stringify(item),
					headers: {
						'content-type': 'application/json'
					}
				}).then(() => {
					window.offlineIdb.getDbRW().delete(item.id);
				}).catch(() => {});
			} else if (item.type === 'favorite') {
				fetch(`${window.offlineIdb.jsonUrl}restaurants/${item.restaurant_id}/?is_favorite=${item.is_favorite.toString()}`, {
					method: 'PUT'
				}).then(() => {
					window.offlineIdb.getDbRW().delete(item.id);
				}).catch(() => {});
			}
		});
	});
}, 10000);