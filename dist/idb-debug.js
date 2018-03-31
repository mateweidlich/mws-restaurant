window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

class Idb {
	constructor() {
		this.jsonUrl = 'http://localhost:1337/restaurants';
		this.dbName = 'restaurant-reviews';
		this.dbVersion = 1;
		this.idb = null;
		this.db = null;

		this.openDb().then(() => {
			this.fillDb();
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
				store.createIndex('neighborhood', 'neighborhood');
				store.createIndex('cuisine_type', 'cuisine_type');
				store.createIndex('neighborhood_cuisine_type', ['neighborhood', 'cuisine_type']);
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
	 * Fill database from json
	 */
	fillDb() {
		fetch(this.jsonUrl)
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

window.idb = new Idb();