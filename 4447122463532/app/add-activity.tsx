import FormField from '@/components/ui/form-field';
import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable } from '@/db/schema';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = {
  id: number;
  name: string;
  colour: string;
  icon: string;
};

export default function AddActivity() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await db.select().from(categoriesTable);
      setCategories(rows);
      if (rows.length > 0) setSelectedCategory(rows[0].id);
    };
    void loadCategories();
  }, []);

  const handleSave = async () => {
    if (!name || !date || !duration || !selectedCategory) {
      alert('Please fill in all required fields');
      return;
    }
    await db.insert(activitiesTable).values({
      tripId: Number(tripId),
      categoryId: selectedCategory,
      name,
      date,
      duration: parseFloat(duration),
      notes: notes || null,
      createdAt: new Date().toISOString(),
    });
    router.back();
  };

  return (
    <ScrollView style={styles.container}>
      <FormField label="Activity Name" value={name} onChangeText={setName} placeholder="e.g. Eiffel Tower visit" />
      <FormField label="Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      <FormField label="Duration (hours)" value={duration} onChangeText={setDuration} placeholder="e.g. 2.5" />

      <Text style={styles.label}>Category</Text>
      <View style={styles.categoryList}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextSelected]}>
              {cat.icon} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FormField label="Notes (optional)" value={notes} onChangeText={setNotes} placeholder="Any notes..." multiline />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  categoryList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  categoryChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  categoryChipSelected: { backgroundColor: '#000', borderColor: '#000' },
  categoryChipText: { fontSize: 13, color: '#000' },
  categoryChipTextSelected: { color: '#fff' },
  saveButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#666', fontSize: 15 },
});