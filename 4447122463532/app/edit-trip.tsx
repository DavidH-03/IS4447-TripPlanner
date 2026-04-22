import DatePicker from '@/components/ui/date-picker';
import FormField from '@/components/ui/form-field';
import { useTheme } from '@/context/theme-context';
import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { TripContext } from './_layout';

// screen for editing an existing trip
export default function EditTrip() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const context = useContext(TripContext);
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  // load trip data from db and prefill form
  useEffect(() => {
    const loadTrip = async () => {
      const rows = await db.select().from(tripsTable).where(eq(tripsTable.id, Number(id)));
      if (rows.length > 0) {
        const trip = rows[0];
        setName(trip.name);
        setDestination(trip.destination);
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
        setNotes(trip.notes || '');
      }
    };
    void loadTrip();
  }, [id]);

  // update trip and refresh context state
  const handleSave = async () => {
    if (!name || !destination || !startDate || !endDate) {
      alert('Please fill in all required fields');
      return;
    }
    await db.update(tripsTable).set({
      name, destination, startDate, endDate,
      notes: notes || null,
    }).where(eq(tripsTable.id, Number(id)));
    const rows = await db.select().from(tripsTable);
    if (context) context.setTrips(rows);
    router.back();
  };

  // form layout for editing trip details
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <FormField label="Trip Name" value={name} onChangeText={setName} placeholder="e.g. Paris Summer" />
      <FormField label="Destination" value={destination} onChangeText={setDestination} placeholder="e.g. Paris, France" />
      <DatePicker label="Start Date" value={startDate} onChange={setStartDate} />
      <DatePicker label="End Date" value={endDate} onChange={setEndDate} />
      <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />

      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={[styles.saveButtonText, { color: colors.background }]}>Save Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={[styles.cancelButtonText, { color: colors.subtext }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// styles for form and buttons
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  saveButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#666', fontSize: 15 },
});