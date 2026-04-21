import FormField from '@/components/ui/form-field';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useEffect, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = {
  id: number;
  name: string;
  colour: string;
  icon: string;
};

const COLOURS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
const ICONS = ['🏛️', '🍽️', '🥾', '🚂', '🏨', '🎭', '🛍️', '🏖️', '⛺', '🎵'];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [colour, setColour] = useState(COLOURS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
  };

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setColour(COLOURS[0]);
    setIcon(ICONS[0]);
    setModalVisible(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setColour(cat.colour);
    setIcon(cat.icon);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name) {
      alert('Please enter a category name');
      return;
    }
    if (editingId) {
      await db.update(categoriesTable).set({ name, colour, icon }).where(eq(categoriesTable.id, editingId));
    } else {
      await db.insert(categoriesTable).values({ name, colour, icon, createdAt: new Date().toISOString() });
    }
    setModalVisible(false);
    loadCategories();
  };

  const handleDelete = async (id: number) => {
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    loadCategories();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>

      {categories.length === 0 ? (
        <Text style={styles.empty}>No categories yet. Add your first one!</Text>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={[styles.colourDot, { backgroundColor: item.colour }]} />
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={styles.name}>{item.name}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>{editingId ? 'Edit Category' : 'Add Category'}</Text>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="e.g. Sightseeing" />

          <Text style={styles.label}>Colour</Text>
          <View style={styles.colourRow}>
            {COLOURS.map((c) => (
              <TouchableOpacity key={c} style={[styles.colourOption, { backgroundColor: c }, colour === c && styles.colourSelected]} onPress={() => setColour(c)} />
            ))}
          </View>

          <Text style={styles.label}>Icon</Text>
          <View style={styles.iconRow}>
            {ICONS.map((i) => (
              <TouchableOpacity key={i} style={[styles.iconOption, icon === i && styles.iconSelected]} onPress={() => setIcon(i)}>
                <Text style={styles.iconText}>{i}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '600', color: '#000', marginBottom: 20 },
  empty: { color: '#999', fontSize: 15, textAlign: 'center', marginTop: 40 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 14 },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  colourDot: { width: 12, height: 12, borderRadius: 6 },
  icon: { fontSize: 18 },
  name: { fontSize: 15, fontWeight: '500', color: '#000' },
  actions: { flexDirection: 'row', gap: 12 },
  editText: { color: '#000', fontSize: 14, fontWeight: '600' },
  deleteText: { color: '#ff3b30', fontSize: 14, fontWeight: '600' },
  addButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 40 },
  modalTitle: { fontSize: 22, fontWeight: '600', color: '#000', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8 },
  colourRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  colourOption: { width: 32, height: 32, borderRadius: 16 },
  colourSelected: { borderWidth: 3, borderColor: '#000' },
  iconRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  iconOption: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  iconSelected: { borderColor: '#000', backgroundColor: '#f0f0f0' },
  iconText: { fontSize: 20 },
  saveButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#666', fontSize: 15 },
});