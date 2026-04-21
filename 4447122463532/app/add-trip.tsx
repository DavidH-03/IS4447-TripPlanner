import FormField from '@/components/ui/form-field';
import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TripContext } from './_layout';

export default function AddTrip() {
  const router = useRouter();
  const context = useContext(TripContext);
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    if (!name || !destination || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }
    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored!);
    await db.insert(tripsTable).values({
      name,
      destination,
      startDate,
      endDate,
      notes: notes || null,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
    const rows = await db.select().from(tripsTable);
    if (context) context.setTrips(rows);
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <FormField label="Trip Name" value={name} onChangeText={setName} placeholder="e.g. Paris Summer" />
      <FormField label="Destination" value={destination} onChangeText={setDestination} placeholder="e.g. Paris, France" />
      <FormField label="Start Date" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />
      <FormField label="End Date" value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />
      <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 15,
  },
});