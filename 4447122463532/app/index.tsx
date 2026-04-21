import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TripContext } from './_layout';

export default function Index() {
  const router = useRouter();
  const context = useContext(TripContext);

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

  const handleDelete = async (id: number) => {
    await db.delete(tripsTable).where(eq(tripsTable.id, id));
    const rows = await db.select().from(tripsTable);
    setTrips(rows);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Trips</Text>
      <TouchableOpacity onPress={() => router.push('/categories')}>
        <Text style={styles.categoriesLink}>Manage Categories</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/settings')}>
  <Text style={styles.categoriesLink}>Settings</Text>
</TouchableOpacity> 
<TouchableOpacity onPress={() => router.push('/targets')}>
  <Text style={styles.categoriesLink}>Targets</Text>
</TouchableOpacity>
<TouchableOpacity onPress={() => router.push('/insights')}>
  <Text style={styles.categoriesLink}>Insights</Text>
</TouchableOpacity>
      {trips.length === 0 ? (
        <Text style={styles.empty}>No trips yet. Add your first trip!</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/trip-detail?id=${item.id}`)}>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.tripName}>{item.name}</Text>
                  <Text style={styles.tripDestination}>{item.destination}</Text>
                  <Text style={styles.tripDates}>{item.startDate} → {item.endDate}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => router.push(`/edit-trip?id=${item.id}`)}>
                    <Text style={styles.editText}>Edit</Text>
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
      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-trip')}>
        <Text style={styles.addButtonText}>+ Add Trip</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
  categoriesLink: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
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