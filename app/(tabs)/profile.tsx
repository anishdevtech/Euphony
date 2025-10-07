import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YouTubeMusicService from '../../src/services/YouTubeMusicService';

export default function ProfileScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginCode, setLoginCode] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  useEffect(() => {
    // Check login status on mount
    setIsLoggedIn(YouTubeMusicService.isLoggedIn());
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const loginInfo = await YouTubeMusicService.login();
      
      setLoginCode(loginInfo.code);
      setVerificationUrl(loginInfo.verificationUrl);
      
      // Show alert with code
      Alert.alert(
        'Login to YouTube',
        `1. Visit: ${loginInfo.verificationUrl}
2. Enter code: ${loginInfo.code}
3. Authorize the app`,
        [
          {
            text: 'Open Browser',
            onPress: () => Linking.openURL(loginInfo.verificationUrl),
          },
          { text: 'OK' },
        ]
      );
      
      // Poll for login status
      const checkInterval = setInterval(() => {
        if (YouTubeMusicService.isLoggedIn()) {
          clearInterval(checkInterval);
          setIsLoggedIn(true);
          setLoading(false);
          setLoginCode('');
          Alert.alert('Success', 'Logged in successfully!');
        }
      }, 2000);
      
      // Stop checking after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        setLoading(false);
      }, 300000);
      
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await YouTubeMusicService.logout();
            setIsLoggedIn(false);
            Alert.alert('Success', 'Logged out successfully');
          },
        },
      ]
    );
  };

  const openVerificationUrl = () => {
    if (verificationUrl) {
      Linking.openURL(verificationUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="person-circle" size={80} color="#0066cc" />
          <Text style={styles.title}>Profile</Text>
        </View>

        {isLoggedIn ? (
          <View style={styles.loggedInContainer}>
            <View style={styles.statusCard}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.statusText}>Logged In</Text>
              <Text style={styles.statusSubtext}>
                You have full access to YouTube Music
              </Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Features Available:</Text>
              <View style={styles.featureItem}>
                <Ionicons name="musical-notes" size={20} color="#0066cc" />
                <Text style={styles.featureText}>Play all songs</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="list" size={20} color="#0066cc" />
                <Text style={styles.featureText}>Access playlists</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color="#0066cc" />
                <Text style={styles.featureText}>Like songs</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="bookmark" size={20} color="#0066cc" />
                <Text style={styles.featureText}>Save favorites</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.loggedOutContainer}>
            <View style={styles.statusCard}>
              <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
              <Text style={styles.statusText}>Not Logged In</Text>
              <Text style={styles.statusSubtext}>
                Login to access all features and play music
              </Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                {loginCode ? (
                  <View>
                    <Text style={styles.codeTitle}>Verification Code</Text>
                    <Text style={styles.code}>{loginCode}</Text>
                    <Text style={styles.instruction}>
                      Enter this code on the verification page
                    </Text>
                    <TouchableOpacity
                      style={styles.openBrowserButton}
                      onPress={openVerificationUrl}
                    >
                      <Ionicons name="open-outline" size={20} color="#fff" />
                      <Text style={styles.openBrowserText}>Open Browser</Text>
                    </TouchableOpacity>
                    <ActivityIndicator size="large" color="#0066cc" style={styles.loader} />
                    <Text style={styles.waiting}>Waiting for authorization...</Text>
                  </View>
                ) : (
                  <ActivityIndicator size="large" color="#0066cc" />
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.loginButtonText}>Login with Google</Text>
              </TouchableOpacity>
            )}

            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>Why login?</Text>
              <Text style={styles.infoText}>
                • Access all YouTube Music content{''}
                • Play age-restricted content{''}
                • Sync your playlists and favorites{''}
                • Better recommendations{''}
                • No ads or restrictions
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Euphony Music Player</Text>
          <Text style={styles.footerSubtext}>Powered by YouTube Music</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  loggedInContainer: {
    flex: 1,
  },
  loggedOutContainer: {
    flex: 1,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  codeTitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  code: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#b3b3b3',
    textAlign: 'center',
    marginBottom: 16,
  },
  openBrowserButton: {
    backgroundColor: '#0066cc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  openBrowserText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 16,
  },
  waiting: {
    fontSize: 14,
    color: '#808080',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#b3b3b3',
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#808080',
    marginTop: 4,
  },
});