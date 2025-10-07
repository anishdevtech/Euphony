import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Linking, ActivityIndicator } from 'react-native';
import YouTubeMusicService from '../services/YouTubeMusicService';

interface LoginPromptProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginPrompt: React.FC<LoginPromptProps> = ({ visible, onClose, onLoginSuccess }) => {
  const [code, setCode] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const loginInfo = await YouTubeMusicService.login();
      setCode(loginInfo.code);
      setVerificationUrl(loginInfo.verificationUrl);
      
      await Linking.openURL(loginInfo.verificationUrl);
      
      const checkAuth = setInterval(() => {
        if (YouTubeMusicService.isLoggedIn()) {
          clearInterval(checkAuth);
          setLoading(false);
          onLoginSuccess();
          onClose();
        }
      }, 2000);
      
      setTimeout(() => clearInterval(checkAuth), 300000);
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error);
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modal}>
          <Text style={styles.title}>Login to YouTube</Text>
          <Text style={styles.description}>
            To play all songs, please login with your Google account
          </Text>

          {!code ? (
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Login with Google</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View>
              <Text style={styles.code}>Code: {code}</Text>
              <Text style={styles.instruction}>
                1. Visit: {verificationUrl}{''}
                2. Enter code: {code}{''}
                3. Authorize the app
              </Text>
              <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
              <Text style={styles.waiting}>Waiting for authorization...</Text>
            </View>
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#b3b3b3',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  code: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 4,
  },
  instruction: {
    fontSize: 14,
    color: '#b3b3b3',
    marginBottom: 24,
    lineHeight: 22,
  },
  loader: {
    marginVertical: 16,
  },
  waiting: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#808080',
    fontSize: 14,
  },
});

export default LoginPrompt;