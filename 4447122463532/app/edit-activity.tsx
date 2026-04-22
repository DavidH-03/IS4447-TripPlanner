import DatePicker from '@/components/ui/date-picker';
import FormField from '@/components/ui/form-field';
import { useTheme } from '@/context/theme-context';
import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// category type used for dropdown selection
type Category = {
  id: number;
  name: string;
  colour: string;
  icon: string;
};

// screen for editing an existing activity
export default function EditActivity() {
  const router = useRouter();
  const { id, tripId } = useLocalSearchParams();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // load categories and existing activity data
  useEffect(() => {
    const load = async () => {
      const cats = await db.select().from(categoriesTable);
      setCategories(cats);
      const rows = await db.select().from(activitiesTable).where(eq(activitiesTable.id, Number(id)));
      if (rows.length > 0) {
        const a = rows[0];
        setName(a.name);
        setDate(a.date);
        setDuration(a.duration.toString());
        setNotes(a.notes || '');
        setSelectedCategory(a.categoryId);
      }
    };
    void load();
  }, [id]);

  // update activity in db with new values
  const handleSave = async () => {
    if (!name || !date || !duration || !selectedCategory) {
      alert('Please fill in all required fields');
      return;
    }
    await db.update(activitiesTable).set({
      name,
      date,
      duration: parseFloat(duration),
      notes: notes || null,
      categoryId: selectedCategory,
    }).where(eq(activitiesTable.id, Number(id)));
    router.back();
  };

  // form layout for editing activity details
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <FormField label="Activity Name" value={name} onChangeText={setName} placeholder="e.g. Eiffel Tower visit" />
      <DatePicker label="Date" value={date} onChange={setDate} />
      <FormField label="Duration (hours)" value={duration} onChangeText={setDuration} placeholder="e.g. 2.5" />

      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      <View style={styles.categoryList}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, { borderColor: colors.border }, selectedCategory === cat.id && styles.categoryChipSelected]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.categoryChipText, { color: colors.text }, selectedCategory === cat.id && styles.categoryChipTextSelected]}>
              {cat.icon} {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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

// basic styles for form and categories
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