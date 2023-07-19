/**
 * Worker для добавления в DB больших объемов данных
 * 
 */
self.onmessage = (event) => {
  const { operation, dbName, dbVersion, storeName, data } = event.data;

  const request = indexedDB.open(dbName, dbVersion);

  request.onerror = function (event) {
    self.postMessage({
      status: "error",
      message: "Ошибка при открытии базы данных",
    });
  };

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName);
    }
  };

  request.onsuccess = function (event) {
    const db = event.target.result;

    if (operation === "addData") {
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);

      transaction.onerror = function (event) {
        self.postMessage({
          status: "error",
          message: "Ошибка при добавлении данных",
        });
      };

      const addRequests = data.map((item) => {
        store.add(item, item.t);
      });
      Promise.allSettled(addRequests).then((results) => {
        const failed = results.some((result) => result.status === "rejected");
        if (failed) {
          self.postMessage({
            status: "error",
            message: "Ошибка при добавлении некоторых элементов",
          });
        } else {
          self.postMessage({ status: "done" });
        }
      });
    }
  };
};
