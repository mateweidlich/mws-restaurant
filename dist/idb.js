window.indexedDB=window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB;class Idb{constructor(){this.jsonUrl="http://localhost:1337/restaurants",this.dbName="restaurant-reviews",this.dbVersion=1,this.idb=null,this.db=null,this.openDb().then(()=>{this.fillDb()})}openDb(){return new Promise((e,t)=>{this.idb=window.indexedDB.open(this.dbName,this.dbVersion),this.idb.onsuccess=(t=>{this.db=t.target.result,e()}),this.idb.onerror=(e=>{console.error("openDb: ",e.target.errorCode),t()}),this.idb.onupgradeneeded=(e=>{const t=e.target.result.createObjectStore(this.dbName,{keyPath:"id"});t.createIndex("neighborhood","neighborhood"),t.createIndex("cuisine_type","cuisine_type"),t.createIndex("neighborhood_cuisine_type",["neighborhood","cuisine_type"])})})}getDbR(){return this.db.transaction(this.dbName).objectStore(this.dbName)}getDbRW(){return this.db.transaction(this.dbName,"readwrite").objectStore(this.dbName)}getAll(){return new Promise((e,t)=>{const r=this.getDbR().getAll();r.onsuccess=(()=>{e(r.result)}),r.onerror=(()=>{t("Error getAll")})})}getById(e){return new Promise((t,r)=>{const n=this.getDbR().get(parseInt(e));n.onsuccess=(()=>{t(n.result)}),n.onerror=(()=>{r("Error getById")})})}getByIndex(e,t){return new Promise((r,n)=>{const s=this.getDbR().index(e).getAll(t);s.onsuccess=(()=>{r(s.result)}),s.onerror=(()=>{n("Error getByIndex")})})}fillDb(){fetch(this.jsonUrl).then(e=>e.json()).then(e=>{if(e.length>0){const t=this.getDbRW();e.forEach(e=>{t.put(e)})}})}}window.idb=new Idb;