// Main App.js for React Native
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Clipboard,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from './services/api';

const COLORS = {
  bg: '#0a0a0f',
  bgSecondary: '#12121a',
  bgTertiary: '#1a1a24',
  text: '#ffffff',
  textSecondary: '#a0a0b0',
  textMuted: '#606070',
  accent: '#6366f1',
  accentHover: '#7c7ff5',
  danger: '#ef4444',
  success: '#22c55e',
  border: '#2a2a3a',
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState({ today: 0, limit: 200000 });
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [subdomain, setSubdomain] = useState('temp');
  const [emailType, setEmailType] = useState('random');
  const [customName, setCustomName] = useState('');

  useEffect(() => {
    loadStoredSession();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmails();
      fetchUsage();
    }
  }, [isLoggedIn]);

  const loadStoredSession = async () => {
    try {
      const stored = await AsyncStorage.getItem('mailtemp_session');
      if (stored) {
        const { token, session } = JSON.parse(stored);
        setToken(token);
        setSessionToken(session);
        ApiService.setSessionToken(session);
        ApiService.setUserToken(token);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Load session error:', error);
    }
  };

  const handleSignup = async () => {
    try {
      const data = await ApiService.signup();
      setNewToken(data.token);
      setShowSignupModal(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogin = async () => {
    if (loginToken.length !== 40) {
      Alert.alert('Error', 'Token must be 40 characters');
      return;
    }

    try {
      const data = await ApiService.login(loginToken);
      setToken(loginToken);
      setSessionToken(data.session_token);
      ApiService.setSessionToken(data.session_token);
      ApiService.setUserToken(loginToken);
      
      await AsyncStorage.setItem('mailtemp_session', JSON.stringify({
        token: loginToken,
        session: data.session_token,
      }));
      
      setIsLoggedIn(true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('mailtemp_session');
    setIsLoggedIn(false);
    setToken('');
    setSessionToken('');
    setEmails([]);
    setMessages([]);
    setSelectedEmail(null);
  };

  const fetchEmails = async () => {
    try {
      const data = await ApiService.listEmails();
      setEmails(data.emails);
    } catch (error) {
      console.error('Fetch emails error:', error);
    }
  };

  const fetchMessages = async (emailId) => {
    try {
      const data = await ApiService.getMessages(emailId);
      setMessages(data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const fetchUsage = async () => {
    try {
      const data = await ApiService.getUsage();
      setUsage(data.usage);
    } catch (error) {
      console.error('Fetch usage error:', error);
    }
  };

  const createEmail = async () => {
    try {
      const name = emailType === 'custom' ? customName : null;
      await ApiService.createEmail(emailType, subdomain, name);
      setShowCreateModal(false);
      setCustomName('');
      fetchEmails();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const deleteEmail = (emailId) => {
    Alert.alert('Delete Email', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiService.deleteEmail(emailId);
            if (selectedEmail?.id === emailId) {
              setSelectedEmail(null);
              setMessages([]);
            }
            fetchEmails();
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEmails();
    if (selectedEmail) await fetchMessages(selectedEmail.id);
    await fetchUsage();
    setRefreshing(false);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Temp Amit Brands</Text>
          <Text style={styles.subtitle}>Privacy-First Temporary Email</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your 40-character token"
            placeholderTextColor={COLORS.textMuted}
            value={loginToken}
            onChangeText={setLoginToken}
            maxLength={40}
            autoCapitalize="none"
          />
          
          <Text style={styles.charCount}>{loginToken.length}/40</Text>

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
            <Text style={styles.secondaryButtonText}>Sign Up - Get New Token</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={showSignupModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Your Token Generated!</Text>
              <Text style={styles.modalSubtitle}>
                Save this token - it's your only way to access your account
              </Text>
              
              <View style={styles.tokenBox}>
                <Text style={styles.tokenText} selectable>
                  {newToken}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => copyToClipboard(newToken)}
              >
                <Text style={styles.secondaryButtonText}>Copy Token</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setLoginToken(newToken);
                  setShowSignupModal(false);
                }}
              >
                <Text style={styles.buttonText}>Use This Token</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {selectedEmail ? selectedEmail.address : 'Your Emails'}
        </Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.usageBar}>
        <Text style={styles.usageText}>
          API Usage: {usage.today.toLocaleString()} / {usage.limit.toLocaleString()}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(usage.today / usage.limit) * 100}%` },
            ]}
          />
        </View>
      </View>

      {selectedEmail ? (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <View style={styles.emailHeader}>
              <TouchableOpacity onPress={() => setSelectedEmail(null)}>
                <Text style={styles.backButton}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => copyToClipboard(selectedEmail.address)}>
                <Text style={styles.copyButton}>Copy Address</Text>
              </TouchableOpacity>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                Emails sent to this address will appear here
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.messageItem, !item.is_read && styles.unread]}>
              <Text style={styles.messageSender}>{item.sender}</Text>
              <Text style={styles.messageSubject}>{item.subject}</Text>
              <Text style={styles.messagePreview} numberOfLines={1}>
                {item.body_text?.substring(0, 100)}
              </Text>
              <Text style={styles.messageTime}>
                {new Date(item.received_at).toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={emails}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No email addresses</Text>
              <Text style={styles.emptySubtitle}>Create your first temporary email</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.emailItem}
              onPress={() => {
                setSelectedEmail(item);
                fetchMessages(item.id);
              }}
            >
              <View style={styles.emailInfo}>
                <Text style={styles.emailAddress}>{item.address}</Text>
                <Text style={styles.emailMeta}>
                  {item.message_count} messages
                  {item.unread_count > 0 && ` • ${item.unread_count} unread`}
                </Text>
              </View>
              <View style={styles.emailActions}>
                <TouchableOpacity onPress={() => copyToClipboard(item.address)}>
                  <Text style={styles.actionButton}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteEmail(item.id)}>
                  <Text style={[styles.actionButton, { color: COLORS.danger }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create New Email</Text>

            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[styles.radioOption, emailType === 'random' && styles.radioActive]}
                onPress={() => setEmailType('random')}
              >
                <Text style={styles.radioText}>Random</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.radioOption, emailType === 'custom' && styles.radioActive]}
                onPress={() => setEmailType('custom')}
              >
                <Text style={styles.radioText}>Custom</Text>
              </TouchableOpacity>
            </View>

            {emailType === 'custom' && (
              <TextInput
                style={styles.input}
                placeholder="Email name"
                placeholderTextColor={COLORS.textMuted}
                value={customName}
                onChangeText={setCustomName}
                autoCapitalize="none"
              />
            )}

            <View style={styles.subdomainGroup}>
              {['temp', 'soul', 'crack'].map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.subdomainOption, subdomain === sub && styles.radioActive]}
                  onPress={() => setSubdomain(sub)}
                >
                  <Text style={styles.radioText}>{sub}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryButton} onPress={createEmail}>
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: COLORS.bgTertiary,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
  },
  charCount: {
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  logoutText: {
    color: COLORS.accent,
  },
  usageBar: {
    padding: 16,
    backgroundColor: COLORS.bgSecondary,
  },
  usageText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  emailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  emailInfo: {
    flex: 1,
  },
  emailAddress: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  emailMeta: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  emailActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    color: COLORS.accent,
    fontSize: 14,
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    color: COLORS.accent,
    fontSize: 16,
  },
  copyButton: {
    color: COLORS.accent,
    fontSize: 14,
  },
  messageItem: {
    padding: 16,
    backgroundColor: COLORS.bgSecondary,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accent,
  },
  messageSender: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageSubject: {
    color: COLORS.text,
    marginBottom: 4,
  },
  messagePreview: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  messageTime: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  tokenBox: {
    backgroundColor: COLORS.bgTertiary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tokenText: {
    color: COLORS.text,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  radioOption: {
    flex: 1,
    padding: 12,
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  radioActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  radioText: {
    color: COLORS.text,
  },
  subdomainGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  subdomainOption: {
    flex: 1,
    padding: 10,
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default App;
