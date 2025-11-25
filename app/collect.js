import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { insertRecord } from './database';

export default function CollectScreen() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [sentiment, setSentiment] = useState(null); // 問卷分數 (1-5)
  const [vlogUri, setVlogUri] = useState(null); // Vlog 檔案 URI
  const [isRecording, setIsRecording] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(null);

  // 1. 請求權限
  useEffect(() => {
    (async () => {
      // 請求相機權限
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      
      // 請求前景位置權限
      const locationStatus = await Location.requestForegroundPermissionsAsync();
      setHasLocationPermission(locationStatus.status === 'granted');
    })();
  }, []);

  // 2. 錄製 Vlog 邏輯 (1 秒)
  const handleVlogRecord = async () => {
    if (cameraRef.current && hasCameraPermission) {
      if (isRecording) return;
      try {
        setIsRecording(true);
        setVlogUri(null); // 重設 URI
        
        // 開始錄製，設定最長 1 秒
        const video = await cameraRef.current.recordAsync({
          maxDuration: 1, 
          quality: Camera.Constants.VideoQuality['480p'],
        });
        
        setIsRecording(false);
        setVlogUri(video.uri);
        Alert.alert("錄影完成", "1 秒 Vlog 已成功記錄！");
      } catch (error) {
        setIsRecording(false);
        Alert.alert("錄影失敗", error.message);
      }
    } else {
        Alert.alert("錯誤", "需要相機權限或攝影機未準備好。");
    }
  };

  // 3. 採集 GPS 座標
  const getLocation = async () => {
    if (!hasLocationPermission) {
      Alert.alert('錯誤', '需要位置權限才能記錄 GPS 座標');
      return { latitude: null, longitude: null }; 
    }
    
    try {
      const location = await Location.getCurrentPositionAsync({});
      return { 
        latitude: location.coords.latitude, 
        longitude: location.coords.longitude 
      };
    } catch (error) {
      Alert.alert('GPS 錯誤', '無法獲取位置資訊，將記錄為 Null');
      return { latitude: null, longitude: null };
    }
  };

  // 4. 提交所有數據
  const handleSubmit = async () => {
    if (sentiment === null) {
      Alert.alert('提醒', '請選擇您的情緒分數！');
      return;
    }
    if (vlogUri === null) {
        Alert.alert('提醒', '請先錄製 1 秒 Vlog！');
        return;
    }
    
    // 獲取 GPS 座標
    const { latitude, longitude } = await getLocation();

    try {
      await insertRecord(sentiment, vlogUri, latitude, longitude);
      Alert.alert('數據已儲存', '本次採集記錄完成。');
      
      // 成功儲存後，清空狀態並返回
      setSentiment(null);
      setVlogUri(null);
      router.back(); 
    } catch (e) {
      Alert.alert('儲存錯誤', e.message);
    }
  };

  // 檢查權限狀態
  if (hasCameraPermission === null || hasLocationPermission === null) {
    return <Text>請求權限中...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>1. 情緒問卷 (1-5)</Text>
      <View style={styles.sentimentRow}>
        {[1, 2, 3, 4, 5].map(score => (
          <TouchableOpacity 
            key={score} 
            style={[styles.scoreButton, sentiment === score && styles.scoreSelected]} 
            onPress={() => setSentiment(score)}
          >
            <Text style={styles.scoreText}>{score}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text>當前分數: {sentiment || '未選擇'}</Text>
      
      <Text style={styles.title}>2. 錄製 1 秒 Vlog</Text>
      <View style={styles.cameraContainer}>
        {hasCameraPermission ? (
            <Camera 
              style={styles.cameraPreview} 
              ref={cameraRef} 
              type={Camera.Constants.Type.front} // 通常用前置鏡頭錄 Vlog
            />
        ) : (
            <Text>無相機權限</Text>
        )}
      </View>
      <Button 
        title={isRecording ? "錄製中..." : (vlogUri ? "重新錄製" : "開始錄製 (1秒)")}
        onPress={handleVlogRecord} 
        disabled={isRecording}
      />
      {vlogUri && <Text style={styles.statusText}>Vlog 已記錄: OK</Text>}

      <Button title="3. 提交數據並記錄 GPS" onPress={handleSubmit} color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 18, marginVertical: 15, fontWeight: 'bold' },
  sentimentRow: { flexDirection: 'row', justifyContent: 'space-around', width: '90%', marginBottom: 20 },
  scoreButton: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  scoreSelected: { backgroundColor: '#B0E0E6', borderColor: '#007BFF' },
  scoreText: { fontSize: 16 },
  cameraContainer: { width: '80%', aspectRatio: 4/3, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  cameraPreview: { flex: 1 },
  statusText: { marginTop: 10, marginBottom: 20, color: 'green' },
});