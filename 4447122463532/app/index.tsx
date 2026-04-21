import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const placeholderTrips = [
  { id: '1', name: 'Paris Summer', destination: 'Paris, France', startDate: '2025-06-01', endDate: '2025-06-07' },
  { id: '2', name: 'Rome Weekend', destination: 'Rome, Italy', startDate: '2025-08-10', endDate: '2025-08-14' },
];

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Trips</Text>
      <FlatList
        data={placeholderTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tripName}>{item.name}</Text>
            <Text style={styles.tripDestination}>{item.destination}</Text>
            <Text style={styles.tripDates}>{item.startDate} → {item.endDate}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.addButton}>
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
    marginBottom: 20,
  },
  card: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 14,
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
});