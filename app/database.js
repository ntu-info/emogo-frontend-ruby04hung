// app/database.js

import * as SQLite from 'expo-sqlite';

// 開啟資料庫
const db = SQLite.openDatabase("emoGo.db");

// 初始化資料庫並創建表格
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS records (
          id INTEGER PRIMARY KEY NOT NULL, 
          timestamp REAL NOT NULL, 
          sentiment INTEGER, 
          vlog_uri TEXT, 
          latitude REAL, 
          longitude REAL
        );`,
        [], // 參數
        () => resolve(), // 成功回調
        (_, error) => reject(error) // 失敗回調
      );
    });
  });
};

// 插入一筆新記錄
export const insertRecord = (sentiment, vlog_uri, latitude, longitude) => {
  return new Promise((resolve, reject) => {
    // 儲存當前時間戳 (毫秒)
    const timestamp = Date.now();
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO records (timestamp, sentiment, vlog_uri, latitude, longitude) VALUES (?, ?, ?, ?, ?);`,
          [timestamp, sentiment, vlog_uri, latitude, longitude],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      },
      (error) => reject(error) // 事務失敗
    );
  });
};

// 查詢所有記錄
export const fetchRecords = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql("SELECT * FROM records", [], (_, { rows }) => {
        resolve(rows._array);
      },
      (_, error) => reject(error)
      );
    });
  });
};

//  輔助函數：將 JavaScript 陣列轉換為 CSV 格式的文本 (用於匯出)
const arrayToCsv = (data) => {
    if (data.length === 0) return '';
    
    // 獲取標題 (列名)
    const header = Object.keys(data[0]);
    const csvHeader = header.join(',');

    // 獲取數據行：使用 JSON.stringify 確保字段中的逗號或換行不會破壞 CSV 結構
    const csvRows = data.map(row => 
        header.map(fieldName => JSON.stringify(row[fieldName])).join(',')
    );

    return [csvHeader, ...csvRows].join('\n');
};
//導出數據：獲取所有記錄並轉換為 CSV 文本。
export const exportDataToCsv = async () => {
    const records = await fetchRecords();
    return arrayToCsv(records);
};