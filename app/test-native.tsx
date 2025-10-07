import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import * as YouTubeExtractor from 'youtube-extractor';

export default function TestNative() {
  const [result, setResult] = useState('Press button to test');

  const testKotlin = () => {
    try {
      const msg = YouTubeExtractor.hello();
      setResult(`✅ Success: ${msg}`);
      console.log('Native module result:', msg);
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      console.error('Native module error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Native Module Test</Text>
      
      <TouchableOpacity style={styles.button} onPress={testKotlin}>
        <Text style={styles.buttonText}>Test Kotlin Function</Text>
      </TouchableOpacity>
      
      <View style={styles.resultBox}>
        <Text style={styles.result}>{result}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    minWidth: 300,
  },
  result: {
    color: '#0066cc',
    fontSize: 16,
    textAlign: 'center',
  },
});