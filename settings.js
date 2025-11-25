import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { Link } from "expo-router";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
// 引入 database.js 裡的函數，用於獲取數據和轉換 CSV
import { fetchRecords, exportDataToCsv } from '../database'; 
// 引入 Notifications 模組來管理提醒
import * as Notifications from 'expo-notifications';


// 實作檔案複製與打包邏輯
const exportData = async () => {
    try {
        const records = await fetchRecords();
        
        // 1. 檢查記錄數量是否符合作業要求 (3 筆以上)
        if (records.length < 3) {
            Alert.alert('提醒', `至少需要 3 筆記錄才能匯出 (目前: ${records.length} 筆)。請繼續採集數據。`);
            return;
        }

        // 2. 準備匯出資料夾
        const exportDir = FileSystem.documentDirectory + 'exported_data/';
        
        // 確保資料夾存在
        const dirInfo = await FileSystem.getInfoAsync(exportDir);
        if (dirInfo.exists) {
            // 如果資料夾已存在，先刪除舊內容
            await FileSystem.deleteAsync(exportDir);
        }
        await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

        // 3. 匯出 CSV 檔案
        const csvContent = await exportDataToCsv();
        const csvPath = exportDir + 'records.csv';
        await FileSystem.writeAsStringAsync(csvPath, csvContent);
        
        // 4. 複製 Vlog 檔案到匯出資料夾
        let vlogCount = 0;
        for (const record of records) {
            if (record.vlog_uri) {
                // 從原始 URI 獲取檔案名
                const fileName = `vlog_${record.id}_${new Date(record.timestamp).toISOString().replace(/[:.]/g, '-')}.mp4`;
                const newPath = exportDir + fileName;
                
                // 檢查檔案是否存在再複製
                const fileInfo = await FileSystem.getInfoAsync(record.vlog_uri);
                if (fileInfo.exists) {
                     await FileSystem.copyAsync({
                        from: record.vlog_uri,
                        to: newPath
                    });
                    vlogCount++;
                }
            }
        }
        
        // 5. 提示用戶完成並提供分享選項
        Alert.alert(
            "匯出成功", 
            `CSV 和 ${vlogCount} 個 Vlog 檔案已準備好。請手動將此資料夾 (exported_data/) 複製並更名為 'data' 後，上傳至 GitHub。`,
            [
                { text: "OK" },
                { 
                    text: "分享 CSV (測試)", 
                    onPress: async () => {
                        if (await Sharing.isAvailableAsync()) {
                             await Sharing.shareAsync(csvPath, { mimeType: 'text/csv', dialogTitle: '分享 EmoGo 數據 CSV' });
                        } else {
                            Alert.alert('錯誤', '設備不支援分享功能。');
                        }
                    }
                }
            ]
        );


    } catch (error) {
        console.error("Export Error:", error);
        Alert.alert('匯出錯誤', `數據匯出失敗: ${error.message}`);
    }
};


export default function SettingsScreen() {
    
  // --- 步驟 2: 通知提醒實作 (在 Settings 畫面中設定) ---
  const scheduleDailyNotifications = async () => {
    // 1. 請求權限
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('錯誤', '未授予通知權限！');
      return;
    }
    
    // 2. 清除所有舊的通知 (避免重複)
    await Notifications.cancelAllScheduledNotificationsAsync();

    // 3. 定義每日三次採集時間 (例如：早上 9 點, 中午 1 點, 晚上 7 點)
    const times = [
      { hour: 9, minute: 0 },   // 09:00 AM
      { hour: 13, minute: 0 },  // 01:00 PM
      { hour: 19, minute: 0 },  // 07:00 PM
    ];

    for (let i = 0; i < times.length; i++) {
        const time = times[i];
        
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "EmoGo 數據採集提醒 📢",
                body: `現在是第 ${i + 1} 次採集時間！請記錄您的情緒和 Vlog。`,
                data: { screen: 'collect' }, // 可用於點擊通知後導航
            },
            trigger: {
                hour: time.hour,
                minute: time.minute,
                repeats: true, // 每日重複
            },
        });
    }

    Alert.alert('提醒已設定', `已設定每日 ${times.length} 次通知，提醒您採集數據。`);
  };
    
  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定與數據管理</Text>
      
      {/* 數據匯出按鈕 */}
      <Button 
        title="1. 匯出數據 (Export→)" 
        onPress={exportData}
        color="#007BFF"
      />
      <Text style={styles.infoText}>* 需至少 3 筆記錄且 Tlast-T1st {'>'} 12h</Text>
      
      {/* 通知提醒按鈕 */}
      <Button 
        title="2. 設定每日採集提醒" 
        onPress={scheduleDailyNotifications}
        color="#FFA500"
      />
      <Text style={styles.infoText}>* 每日 3 次提醒您記錄數據</Text>

      {/* 原有的 Link 回到 Home Tab */}
      <Link href="/(tabs)" style={styles.link}>
        返回主頁
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    marginTop: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  link: {
    fontSize: 16,
    marginTop: 30,
    textDecorationLine: "underline",
    color: '#007BFF'
  },
  infoText: {
      fontSize: 12,
      color: '#666',
      marginBottom: 30,
      marginTop: 5,
  }
});