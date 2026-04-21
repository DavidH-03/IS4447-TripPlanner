import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable, trips as tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Activity = {
  id: number;
  name: string;
  date: string;
  duration: number;
  notes: string | null;
  categoryId: number;
};

type Trip = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
};

type Category = {
  id: number;
  name: string;
  icon: string;
};

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const load = async () => {
      const tripRows = await db.select().from(tripsTable).where(eq(tripsTable.id, Number(id)));
      if (tripRows.length > 0) setTrip(tripRows[0]);
      const activityRows = await db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
      setActivities(activityRows);
      const catRows = await db.select().from(categoriesTable);
      setCategories(catRows);
    };
    void load();
  }, [id]);

  const handleDeleteActivity = async (activityId: number) => {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, activityId));
    const rows = await db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
    setActivities(rows);
  };

  const filteredActivities = activities.filter(a => {
    const matchesSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || (a.notes && a.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === null || a.categoryId === selectedCategory;
    const matchesFrom = fromDate === '' || a.date >= fromDate;
    const matchesTo = toDate === '' || a.date <= toDate;
    return matchesSearch && matchesCategory && matchesFrom && matchesTo;
  });

  if (!trip) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.tripName}>{trip.name}</Text>
      <Text style={styles.destination}>{trip.destination}</Text>
      <Text style={styles.dates}>{trip.startDate} → {trip.endDate}</Text>
      {trip.notes ? <Text style={styles.notes}>{trip.notes}</Text> : null}

      <Text style={styles.sectionHeader}>Activities</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search activities..."
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Text style={styles.filterToggle}>{showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}</Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterBox}>
          <View style={styles.dateRow}>
            <TextInput
              style={[styles.dateInput]}
              placeholder="From (YYYY-MM-DD)"
              value={fromDate}
              onChangeText={setFromDate}
            />
            <TextInput
              style={[styles.dateInput]}
              placeholder="To (YYYY-MM-DD)"
              value={toDate}
              onChangeText={setToDate}
            />
          </View>
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[styles.catChip, selectedCategory === null && styles.catChipSelected]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.catChipText, selectedCategory === null && styles.catChipTextSelected]}>All</Text>
            </TouchableOpacity>
            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, selectedCategory === c.id && styles.catChipSelected]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text style={[styles.catChipText, selectedCategory === c.id && styles.catChipTextSelected]}>{c.icon} {c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filteredActivities.length === 0 ? (
        <Text style={styles.empty}>No activities found.</Text>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.activityCard}>
              <View style={styles.activityContent}>
                <Text style={styles.activityName}>{item.name}</Text>
                <Text style={styles.activityMeta}>{item.date} · {item.duration}h</Text>
                {item.notes ? <Text style={styles.activityNotes}>{item.notes}</Text> : null}
              </View>
              <View style={styles.activityActions}>
                <TouchableOpacity onPress={() => router.push(`/edit-activity?id=${item.id}&tripId=${id}`)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteActivity(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push(`/add-activity?tripId=${id}`)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 16 },
  tripName: { fontSize: 22, fontWeight: '700', color: '#000' },
  destination: { fontSize: 15, color: '#666', marginTop: 4 },
  dates: { fontSize: 13, color: '#999', marginTop: 4 },
  notes: { fontSize: 13, color: '#666', marginTop: 8 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: '#000', marginTop: 24, marginBottom: 8 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, marginBottom: 8 },
  filterToggle: { color: '#666', fontSize: 13, marginBottom: 8 },
  filterBox: { marginBottom: 12 },
  dateRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dateInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  catChipSelected: { backgroundColor: '#000', borderColor: '#000' },
  catChipText: { fontSize: 12, color: '#000' },
  catChipTextSelected: { color: '#fff' },
  empty: { color: '#999', fontSize: 14, marginTop: 8 },
  activityCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 12 },
  activityContent: { flex: 1 },
  activityName: { fontSize: 15, fontWeight: '600', color: '#000' },
  activityMeta: { fontSize: 13, color: '#666', marginTop: 2 },
  activityNotes: { fontSize: 12, color: '#999', marginTop: 2 },
  activityActions: { flexDirection: 'row', gap: 12 },
  editText: { color: '#000', fontSize: 14, fontWeight: '600' },
  deleteText: { color: '#ff3b30', fontSize: 14, fontWeight: '600' },
  addButton: { backgroundColor: '#000', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});