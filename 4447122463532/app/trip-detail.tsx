import DatePicker from '@/components/ui/date-picker';
import { useTheme } from '@/context/theme-context';
import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable, trips as tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// activity type used for list rendering
type Activity = {
  id: number;
  name: string;
  date: string;
  duration: number;
  notes: string | null;
  categoryId: number;
};

// trip type for header info
type Trip = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
};

// category type for filtering and display
type Category = {
  id: number;
  name: string;
  icon: string;
};

// country info fetched from api
type CountryInfo = {
  flag: string;
  capital: string;
  currency: string;
  population: string;
};

// screen showing trip details and its activities
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
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null);
  const [countryLoading, setCountryLoading] = useState(false);
  const [countryError, setCountryError] = useState('');
  const { colors } = useTheme();

  // format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // fetch basic country info based on destination string
  const fetchCountryInfo = async (destination: string) => {
    setCountryLoading(true);
    setCountryError('');
    try {
      const parts = destination.split(',');
      const country = parts.length > 1 ? parts.pop()?.trim() : parts[0].split(' ').pop()?.trim();
      const res = await fetch(`https://restcountries.com/v3.1/name/${country}`);
      const data = await res.json();

      if (data && data.length > 0) {
        const c = data[0];
        const currencyCode = Object.keys(c.currencies || {})[0];
        const currencyName = c.currencies?.[currencyCode]?.name || 'Unknown';

        setCountryInfo({
          flag: c.flag,
          capital: c.capital?.[0] || 'Unknown',
          currency: `${currencyCode} - ${currencyName}`,
          population: c.population.toLocaleString(),
        });
      } else {
        setCountryError('Country info not found');
      }
    } catch (e) {
      setCountryError('Failed to load country info');
    }
    setCountryLoading(false);
  };

  // load trip, activities and categories on mount
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const tripRows = await db.select().from(tripsTable).where(eq(tripsTable.id, Number(id)));
        if (tripRows.length > 0) {
          setTrip(tripRows[0]);
          await fetchCountryInfo(tripRows[0].destination);
        }
        const activityRows = await db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
        setActivities(activityRows);
        const catRows = await db.select().from(categoriesTable);
        setCategories(catRows);
      };
      void load();
    }, [id])
  );

  // confirm and delete activity then refresh list
  const handleDeleteActivity = async (activityId: number) => {
    Alert.alert('Delete Activity', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await db.delete(activitiesTable).where(eq(activitiesTable.id, activityId));
        const rows = await db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
        setActivities(rows);
      }}
    ]);
  };

  // apply search, category and date filters
  const filteredActivities = activities.filter(a => {
    const matchesSearch = search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || (a.notes && a.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === null || a.categoryId === selectedCategory;
    const matchesFrom = fromDate === '' || a.date >= fromDate;
    const matchesTo = toDate === '' || a.date <= toDate;
    return matchesSearch && matchesCategory && matchesFrom && matchesTo;
  });

  if (!trip) return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={{ color: colors.text }}>Loading...</Text>
    </View>
  );

  // main layout with trip info, filters and activity list
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.tripName, { color: colors.text }]}>{trip.name}</Text>
      <Text style={[styles.destination, { color: colors.subtext }]}>{trip.destination}</Text>
      <Text style={[styles.dates, { color: colors.subtext }]}>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</Text>
      {trip.notes ? <Text style={[styles.notes, { color: colors.subtext }]}>{trip.notes}</Text> : null}

      {countryLoading ? (
        <Text style={[styles.countryLoading, { color: colors.subtext }]}>Loading country info...</Text>
      ) : countryError ? (
        <Text style={[styles.countryLoading, { color: colors.subtext }]}>{countryError}</Text>
      ) : countryInfo ? (
        <View style={[styles.countryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.countryTitle, { color: colors.text }]}>{countryInfo.flag} Destination Info</Text>
          <Text style={[styles.countryDetail, { color: colors.subtext }]}>Capital: {countryInfo.capital}</Text>
          <Text style={[styles.countryDetail, { color: colors.subtext }]}>Currency: {countryInfo.currency}</Text>
          <Text style={[styles.countryDetail, { color: colors.subtext }]}>Population: {countryInfo.population}</Text>
        </View>
      ) : null}

      <Text style={[styles.sectionHeader, { color: colors.text }]}>Activities</Text>

      <TextInput
        style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]}
        placeholder="Search activities..."
        placeholderTextColor={colors.subtext}
        value={search}
        onChangeText={setSearch}
      />

      <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
        <Text style={[styles.filterToggle, { color: colors.subtext }]}>{showFilters ? 'Hide Filters ▲' : 'Show Filters ▼'}</Text>
      </TouchableOpacity>

      {showFilters && (
        <View style={styles.filterBox}>
          <DatePicker label="From" value={fromDate} onChange={setFromDate} />
          <DatePicker label="To" value={toDate} onChange={setToDate} />

          {/* category filter chips */}
          <View style={styles.categoryRow}>
            <TouchableOpacity
              style={[styles.catChip, { borderColor: colors.border }, selectedCategory === null && styles.catChipSelected]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.catChipText, { color: colors.text }, selectedCategory === null && styles.catChipTextSelected]}>All</Text>
            </TouchableOpacity>

            {categories.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, { borderColor: colors.border }, selectedCategory === c.id && styles.catChipSelected]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text style={[styles.catChipText, { color: colors.text }, selectedCategory === c.id && styles.catChipTextSelected]}>
                  {c.icon} {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filteredActivities.length === 0 ? (
        <Text style={[styles.empty, { color: colors.subtext }]}>No activities found.</Text>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id.toString()}
          // render each activity with edit/delete actions
          renderItem={({ item }) => (
            <View style={[styles.activityCard, { borderBottomColor: colors.border }]}>
              <View style={[styles.categoryDot, { backgroundColor: categories.find(c => c.id === item.categoryId)?.colour || colors.border }]} />
              <View style={styles.activityContent}>
                <Text style={[styles.activityName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.activityMeta, { color: colors.subtext }]}>{formatDate(item.date)} · {item.duration}h</Text>
                {item.notes ? <Text style={[styles.activityNotes, { color: colors.subtext }]}>{item.notes}</Text> : null}
              </View>
              <View style={styles.activityActions}>
                <TouchableOpacity onPress={() => router.push(`/edit-activity?id=${item.id}&tripId=${id}`)}>
                  <Text style={[styles.editText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteActivity(item.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => router.push(`/add-activity?tripId=${id}`)}>
        <Text style={[styles.addButtonText, { color: colors.background }]}>+ Add Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles for layout, cards and filters
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 16 },
  tripName: { fontSize: 26, fontWeight: '700', color: '#000', marginBottom: 4 },
  destination: { fontSize: 18, color: '#666' },
  dates: { fontSize: 15, color: '#999', marginTop: 2 },
  notes: { fontSize: 15, color: '#666', marginTop: 6, fontStyle: 'italic' },
  countryCard: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 12, marginBottom: 4 },
  countryTitle: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  countryDetail: { fontSize: 13, marginTop: 2 },
  countryLoading: { fontSize: 13, marginTop: 8 },
  sectionHeader: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 20, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, padding: 10, paddingHorizontal: 16, fontSize: 14, marginBottom: 8 },
  filterToggle: { color: '#666', fontSize: 13, marginBottom: 8 },
  filterBox: { marginBottom: 12 },
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
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10, marginTop: 4 },
});