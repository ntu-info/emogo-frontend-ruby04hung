import { Stack } from "expo-router";
// 移除了 expo-status-bar 的引用，以解決雲端建構錯誤
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
      {/* 移除了 <StatusBar style="auto" /> 標籤 */}
      <Stack>
        {/* The (tabs) group is one Stack screen with its own tab navigator */}
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        {/* Details screen (原範例) */}
        <Stack.Screen
          name="details"
          options={{ title: "Details" }}
        />
        {/* 新增 collect 畫面：用於採集數據 (在 app/collect.js) */}
        <Stack.Screen
          name="collect"
          options={{ title: "採集情緒數據" }}
        />
      </Stack>
    </>
  );
}