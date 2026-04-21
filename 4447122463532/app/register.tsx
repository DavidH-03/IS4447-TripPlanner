import FormField from '@/components/ui/form-field';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      alert('An account with this email already exists');
      return;
    }
    await db.insert(users).values({
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    });
    const newUser = await db.select().from(users).where(eq(users.email, email));
    await AsyncStorage.setItem('user', JSON.stringify({ id: newUser[0].id, name: newUser[0].name, email: newUser[0].email }));
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Start tracking your trips</Text>

      <FormField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <FormField label="Email" value={email} onChangeText={setEmail} placeholder="your@email.com" />
      <FormField label="Password" value={password} onChangeText={setPassword} placeholder="Choose a password" secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={() => router.back()}>
        <Text style={styles.linkText}>Already have an account? Login</Text>
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