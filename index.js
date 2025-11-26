import { View, Text, StyleSheet } from "react-native";
import { useRouter, Link } from "expo-router";

export default function HomeTabScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EmoGo 數據採集專案</Text>
      <Text style={styles.subtitle}>請點擊下方開始採集多模態數據</Text>
      
      {/* 使用 Link 導航到新的 collect 畫面 (在 app/collect.js) */}
      <Link 
        href="/collect" 
        style={styles.linkButton}
      >
        <Text style={styles.buttonText}>開始採集情緒數據 (問卷/Vlog/GPS)</Text>
      </Link>
      
      {/* 原有的 Link 範例，保持不動 */}
      <Link href="/details" style={styles.link}>
        Go to Details screen (範例)
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333'
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666'
  },
  link: {
    fontSize: 16,
    marginTop: 16,
    textDecorationLine: "underline",
    color: '#007BFF'
  },
  linkButton: {
    backgroundColor: '#28A745', // 綠色按鈕
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginVertical: 20,
    width: 300,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});