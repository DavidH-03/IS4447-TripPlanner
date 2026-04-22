import { useTheme } from '@/context/theme-context';
import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TripContext } from './_layout';

// main home screen showing trips and navigation
export default function Index() {
  const router = useRouter();
  const context = useContext(TripContext);
  const { colors } = useTheme();

  // check if user is logged in, redirect if not
  useEffect(() => {
    const checkAuth = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (!stored) {
        router.replace('/login');
      }
    };
    void checkAuth();
  }, []);

  if (!context) return null;
  const { trips, setTrips } = context;

  // delete trip then refresh list from db
  const handleDelete = async (id: number) => {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await db.delete(tripsTable).where(eq(tripsTable.id, id));
          const rows = await db.select().from(tripsTable);
          setTrips(rows);
        }
      }
    ]);
  };

  // layout with header, nav shortcuts and trip list
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandRow}>
        <Text style={[styles.brandIcon]}>✈️</Text>
        <View>
          <Text style={[styles.brandName, { color: colors.text }]}>Tripit</Text>
          <Text style={[styles.brandSub, { color: colors.subtext }]}>Your travel companion</Text>
        </View>
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.card }]} onPress={() => router.push('/insights')}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={[styles.navLabel, { color: colors.text }]}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.card }]} onPress={() => router.push('/targets')}>
          <Text style={styles.navIcon}>🎯</Text>
          <Text style={[styles.navLabel, { color: colors.text }]}>Targets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.card }]} onPress={() => router.push('/categories')}>
          <Text style={styles.navIcon}>🏷️</Text>
          <Text style={[styles.navLabel, { color: colors.text }]}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.card }]} onPress={() => router.push('/settings')}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[styles.navLabel, { color: colors.text }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {trips.length === 0 ? (
        <Text style={[styles.empty, { color: colors.subtext }]}>No trips yet. Add your first trip!</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          // render each trip with edit and delete actions
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/trip-detail?id=${item.id}`)}>
              <View style={[styles.card, { borderBottomColor: colors.border }]}>
                <View style={styles.cardContent}>
                  <Text style={[styles.tripName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.tripDestination, { color: colors.subtext }]}>{item.destination}</Text>
                  <Text style={[styles.tripDates, { color: colors.subtext }]}>
                    {new Date(item.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} → {new Date(item.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => router.push(`/edit-trip?id=${item.id}`)}>
                    <Text style={[styles.editText, { color: colors.text }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary }]} onPress={() => router.push('/add-trip')}>
        <Text style={[styles.addButtonText, { color: colors.background }]}>+ Add Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

// styles for layout, cards and navigation buttons
const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  brandIcon: { fontSize: 32 },
  brandName: { fontSize: 22, fontWeight: '700' },
  brandSub: { fontSize: 13, marginTop: 2 },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: 60,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  navRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  navButton: { flex: 1, borderRadius: 10, padding: 10, alignItems: 'center' },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 11, marginTop: 4 },
  empty: {
    color: '#999',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
  },
  cardContent: {
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tripName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  tripDestination: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tripDates: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  editText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
});