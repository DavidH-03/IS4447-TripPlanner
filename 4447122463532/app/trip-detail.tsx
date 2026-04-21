import { db } from '@/db/client';
import { activities as activitiesTable, trips as tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const load = async () => {
      const tripRows = await db.select().from(tripsTable).where(eq(tripsTable.id, Number(id)));
      if (tripRows.length > 0) setTrip(tripRows[0]);
      const activityRows = await db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
      setActivities(activityRows);
    };
    void load();
  }, [id]);

  const handleDeleteActivity = async (activityId: number) => {
    await db.delete(activitiesTable).where(eq(activitiesTable.id, activityId));
    const rows = await db.select().from(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
    setActivities(rows);
  };

  if (!trip) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      <Text style={styles.tripName}>{trip.name}</Text>
      <Text style={styles.destination}>{trip.destination}</Text>
      <Text style={styles.dates}>{trip.startDate} → {trip.endDate}</Text>
      {trip.notes ? <Text style={styles.notes}>{trip.notes}</Text> : null}

      <Text style={styles.sectionHeader}>Activities</Text>

      {activities.length === 0 ? (
        <Text style={styles.empty}>No activities yet. Add your first one!</Text>
      ) : (
        <FlatList
          data={activities}
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