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
				const store = event.target.result.createObjectStore(
					this.dbName, {
						keyPath: 'id'
					}
				);

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
				resolve(json);
			}).catch(() => {
				// TODO: try to save later
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

				const request = this.getDbRW().put(restaurant);
				request.onsuccess = () => {
					fetch(`${this.jsonUrl}restaurants/${restaurant.id}/?is_favorite=${isFav.toString()}`, {
						method: 'PUT'
					}).then(() => {
						resolve();
					}).catch(() => {
						// TODO: try to save later
						resolve();
					});
				};
				request.onerror = () => {
					reject('Error setFavoriteById');
				};
			}).catch((error) => {
				reject(error);
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