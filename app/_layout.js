import { Stack } from "expo-router";
// 引入 StatusBar 來控制狀態欄
import { StatusBar } from "expo-status-bar"; 
import { useEffect } from 'react';
import { initDatabase } from './database'; // <-- 引入資料庫初始化函數

export default function RootLayout() {
  useEffect(() => {
    // 應用程式啟動時，初始化 SQLite 資料庫
    initDatabase()
      .then(() => console.log("Database initialized successfully."))
      .catch(error => console.error("Database initialization error: ", error));
  }, []);

  return (
    <>
      {/* 確保狀態欄設置為自動模式 */}
      <StatusBar style="auto" />
      <Stack>
        {/* The (tabs) group: Tab Navigator 的容器 */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        {/* Details screen (原範例) */}
        <Stack.Screen
          name="details"
          options={{ title: "Details" }}
        />
        {/* 新增 collect 畫面：用戶將在此畫面採集數據 (相對路徑: /collect) */}
        <Stack.Screen
          name="collect"
          options={{ title: "採集情緒數據" }}
        />
      </Stack>
    </>
  );
}