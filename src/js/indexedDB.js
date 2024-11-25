import { INDEXDB_NAME, INDEXDB_VERSION, STORE_NAME } from "./constants.js";

export class DatabaseStickyNotes {

  constructor(databaseName, databaseVersion) {
    this.databaseName = databaseName;
    this.databaseVersion = databaseVersion;
    this.db = null;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseStickyNotes(INDEXDB_NAME, INDEXDB_VERSION);
    }
    return this.instance;
  }

  open() {
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(this.databaseName, this.databaseVersion);
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
      request.onupgradeneeded = (event) => {
        let db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }
  createData(data) {
    if (!this.db) {
      throw new Error("The database is not open");
    }
    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.add(data);
      request.onsuccess = (event) => {
      const id = event.target.result;
      resolve(id); 
      };
      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  readData(id) {
    if (!this.db) {
      throw new Error("The database is not open.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readonly");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.get(id);

      request.onsuccess = (event) => {
        let data = event.target.result;
        if (data) {
          resolve(data);
        } else {
          reject(new Error("The object with the specified ID: " + id + ", was not found in the database."));
        }
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  readAllData() {
    if (!this.db) {
      throw new Error("The database is not open.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction(STORE_NAME);
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.getAll();

      request.onsuccess = (event) => {
        let data = event.target.result;
        if (data) {
          resolve(data);
        } else {
          reject(new Error("Error get data"));
        }
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  updateData(id, newData) {
    if (!this.db) {
      throw new Error("The database is not open.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
      let getRequest = objectStore.get(id);

      getRequest.onsuccess = (event) => {
        const existingData = event.target.result;
        if (existingData) {
          let updatedData = { ...existingData, ...newData };
          let updateRequest = objectStore.put(updatedData);

          updateRequest.onsuccess = () => {
            resolve();
          };

          updateRequest.onerror = (event) => {
            reject(event.target.error);
          };
        } else {
          reject(new Error("The object with the specified ID was not found in the database."));
        }
      };

      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });

  }

  deleteData(id) {
    if (!this.db) {
      throw new Error("The database is not open.");
    }

    return new Promise((resolve, reject) => {
      let transaction = this.db.transaction([STORE_NAME], "readwrite");
      let objectStore = transaction.objectStore(STORE_NAME);
      let request = objectStore.delete(id);

      request.onsuccess = (event) => {
        resolve();
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

}
