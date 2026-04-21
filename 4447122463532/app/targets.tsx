import FormField from '@/components/ui/form-field';
import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable, targets as targetsTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Target = {
  id: number;
  name: string;
  type: string;
  period: string;
  targetValue: number;
  categoryId: number | null;
};

type Category = {
  id: number;
  name: string;
  icon: string;
};

export default function Targets() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('count');
  const [period, setPeriod] = useState('weekly');
  const [targetValue, setTargetValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [progress, setProgress] = useState<Record<number, number>>({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const t = await db.select().from(targetsTable);
    const c = await db.select().from(categoriesTable);
    setTargets(t);
    setCategories(c);
    calculateProgress(t);
  };

  const calculateProgress = async (targets: Target[]) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allActivities = await db.select().from(activitiesTable);
    const progressMap: Record<number, number> = {};

    for (const target of targets) {
      const start = target.period === 'weekly' ? startOfWeek : startOfMonth;
      const filtered = allActivities.filter(a => {
        const actDate = new Date(a.date);
        const inPeriod = actDate >= start && actDate <= now;
        const inCategory = target.categoryId ? a.categoryId === target.categoryId : true;
        return inPeriod && inCategory;
      });
      if (target.type === 'count') {
        progressMap[target.id] = filtered.length;
      } else {
        progressMap[target.id] = filtered.reduce((sum, a) => sum + a.duration, 0);
      }
    }
    setProgress(progressMap);
  };

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setType('count');
    setPeriod('weekly');
    setTargetValue('');
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name || !targetValue) {
      alert('Please fill in all fields');
      return;
    }
    const stored = await AsyncStorage.getItem('user');
    const user = JSON.parse(stored!);

    if (editingId) {
      await db.update(targetsTable).set({
        name, type, period,
        targetValue: parseFloat(targetValue),
        categoryId: selectedCategory,
      }).where(eq(targetsTable.id, editingId));
    } else {
      await db.insert(targetsTable).values({
        userId: user.id,
        name, type, period,
        targetValue: parseFloat(targetValue),
        categoryId: selectedCategory,
        createdAt: new Date().toISOString(),
      });
    }
    setModalVisible(false);
    loadData();
  };

  const handleDelete = async (id: number) => {
    await db.delete(targetsTable).where(eq(targetsTable.id, id));
    loadData();
  };

  const getCategoryName = (id: number | null) => {
    if (!id) return 'All Activities';
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Targets</Text>

      {targets.length === 0 ? (
        <Text style={styles.empty}>No targets yet. Add your first one!</Text>
      ) : (
        <FlatList
          data={targets}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const current = progress[item.id] || 0;
            const percentage = Math.min((current / item.targetValue) * 100, 100);
            const exceeded = current >= item.targetValue;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.targetName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.targetMeta}>
                  {item.period} · {getCategoryName(item.categoryId)}
                </Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${percentage}%` as any, backgroundColor: exceeded ? '#34c759' : '#000' }]} />
                </View>
                <Text style={[styles.progressText, exceeded && styles.exceeded]}>
                  {current} / {item.targetValue} {item.type === 'duration' ? 'hours' : 'activities'}
                  {exceeded ? ' ✓ Target met!' : ` (${(item.targetValue - current).toFixed(1)} remaining)`}
                </Text>
              </View>
            );
          }}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Text style={styles.addButtonText}>+ Add Target</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView style={styles.modal}>
          <Text style={styles.modalTitle}>Add Target</Text>
          <FormField label="Target Name" value={name} onChangeText={setName} placeholder="e.g. Activities per week" />
          <FormField label="Target Value" value={targetValue} onChangeText={setTargetValue} placeholder="e.g. 5" />

          <Text style={styles.label}>Type</Text>
          <View style={styles.row}>
            {['count', 'duration'].map(t => (
              <TouchableOpacity key={t} style={[styles.chip, type === t && styles.chipSelected]} onPress={() => setType(t)}>
                <Text style={[styles.chipText, type === t && styles.chipTextSelected]}>{t === 'count' ? 'Count' : 'Duration (hrs)'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Period</Text>
          <View style={styles.row}>
            {['weekly', 'monthly'].map(p => (
              <TouchableOpacity key={p} style={[styles.chip, period === p && styles.chipSelected]} onPress={() => setPeriod(p)}>
                <Text style={[styles.chipText, period === p && styles.chipTextSelected]}>{p === 'weekly' ? 'Weekly' : 'Monthly'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category (optional)</Text>
          <View style={styles.row}>
            <TouchableOpacity style={[styles.chip, selectedCategory === null && styles.chipSelected]} onPress={() => setSelectedCategory(null)}>
              <Text style={[styles.chipText, selectedCategory === null && styles.chipTextSelected]}>All</Text>
            </TouchableOpacity>
            {categories.map(c => (
              <TouchableOpacity key={c.id} style={[styles.chip, selectedCategory === c.id && styles.chipSelected]} onPress={() => setSelectedCategory(c.id)}>
                <Text style={[styles.chipText, selectedCategory === c.id && styles.chipTextSelected]}>{c.icon} {c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Target</Text>
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
  card: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  targetName: { fontSize: 16, fontWeight: '600', color: '#000' },
  targetMeta: { fontSize: 13, color: '#666', marginTop: 2, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 6 },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 13, color: '#666' },
  exceeded: { color: '#34c759', fontWeight: '600' },
  deleteText: { color: '#ff3b30', fontSize: 14, fontWeight: '600' },
  addButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  modal: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 40 },
  modalTitle: { fontSize: 22, fontWeight: '600', color: '#000', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  chipSelected: { backgroundColor: '#000', borderColor: '#000' },
  chipText: { fontSize: 13, color: '#000' },
  chipTextSelected: { color: '#fff' },
  saveButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cancelButton: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#666', fontSize: 15 },
});