import { useTheme } from '@/context/theme-context';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { TripContext } from './_layout';

// settings screen for account info and preferences
export default function Settings() {
  const router = useRouter();
  const context = useContext(TripContext);
  const { theme, toggleTheme, colors } = useTheme();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // load user details from async storage
  useEffect(() => {
    AsyncStorage.getItem('user').then(stored => {
      if (stored) {
        const user = JSON.parse(stored);
        setUserName(user.name);
        setUserEmail(user.email);
      }
    });
  }, []);

  // clear stored session and redirect to login
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    router.replace('/login');
  };

  // confirm then delete user account from db
  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const stored = await AsyncStorage.getItem('user');
            if (stored) {
              const user = JSON.parse(stored);
              await db.delete(users).where(eq(users.id, user.id));
              await AsyncStorage.removeItem('user');
              router.replace('/login');
            }
          },
        },
      ]
    );
  };

  // layout showing user info, theme toggle and account actions
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Settings</Text>

      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.userName, { color: colors.text }]}>{userName}</Text>
        <Text style={[styles.userEmail, { color: colors.subtext }]}>{userEmail}</Text>
      </View>

      <View style={[styles.row, { borderBottomColor: colors.border }]}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
        />
      </View>

      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleLogout}>
        <Text style={[styles.buttonText, { color: colors.background }]}>Logout</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
        <Text style={styles.dangerButtonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles for layout and settings rows
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
  userCard: { borderWidth: 1, borderRadius: 10, padding: 16, marginBottom: 24 },
  userName: { fontSize: 16, fontWeight: '600' },
  userEmail: { fontSize: 14, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, marginBottom: 24 },
  rowLabel: { fontSize: 16 },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { fontSize: 15, fontWeight: '600' },
  dangerButton: { borderWidth: 1, borderColor: '#ff3b30', padding: 14, borderRadius: 8, alignItems: 'center' },
  dangerButtonText: { color: '#ff3b30', fontSize: 15, fontWeight: '600' },
});