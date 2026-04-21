import FormField from '@/components/ui/form-field';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }
    const result = await db.select().from(users).where(eq(users.email, email));
    if (result.length === 0 || result[0].password !== password) {
      alert('Invalid email or password');
      return;
    }
    const user = result[0];
    await AsyncStorage.setItem('user', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>TripTracker</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <FormField label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" />
      <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.push('/register')}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 80 },
  title: { fontSize: 32, fontWeight: '700', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
  button: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  link: { alignItems: 'center', marginTop: 16 },
  linkText: { color: '#666', fontSize: 14 },
});