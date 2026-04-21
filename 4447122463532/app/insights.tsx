import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable } from '@/db/schema';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type CategoryStat = {
  name: string;
  colour: string;
  icon: string;
  totalDuration: number;
  count: number;
};

const SCREEN_WIDTH = Dimensions.get('window').width - 32;

export default function Insights() {
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [totalHours, setTotalHours] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [period])
  );

  const loadStats = async () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const allActivities = await db.select().from(activitiesTable);
    const allCategories = await db.select().from(categoriesTable);

    const filtered = allActivities.filter(a => {
      if (period === 'all') return true;
      const actDate = new Date(a.date);
      if (period === 'weekly') return actDate >= startOfWeek && actDate <= now;
      if (period === 'monthly') return actDate >= startOfMonth && actDate <= now;
      return true;
    });

    const statsMap: Record<number, CategoryStat> = {};
    for (const cat of allCategories) {
      statsMap[cat.id] = { name: cat.name, colour: cat.colour, icon: cat.icon, totalDuration: 0, count: 0 };
    }

    for (const act of filtered) {
      if (statsMap[act.categoryId]) {
        statsMap[act.categoryId].totalDuration += act.duration;
        statsMap[act.categoryId].count += 1;
      }
    }

    const statsArray = Object.values(statsMap).filter(s => s.count > 0);
    setStats(statsArray);
    setTotalHours(filtered.reduce((sum, a) => sum + a.duration, 0));
    setTotalActivities(filtered.length);
  };

  const maxDuration = Math.max(...stats.map(s => s.totalDuration), 1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Insights</Text>

      <View style={styles.periodRow}>
        {(['weekly', 'monthly', 'all'] as const).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, period === p && styles.periodChipSelected]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodChipText, period === p && styles.periodChipTextSelected]}>
              {p === 'weekly' ? 'This Week' : p === 'monthly' ? 'This Month' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalActivities}</Text>
          <Text style={styles.summaryLabel}>Activities</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalHours.toFixed(1)}</Text>
          <Text style={styles.summaryLabel}>Hours</Text>
        </View>
      </View>

      {stats.length === 0 ? (
        <Text style={styles.empty}>No activities for this period.</Text>
      ) : (
        <>
          <Text style={styles.sectionHeader}>Hours by Category</Text>
          {stats.map((stat) => (
            <View key={stat.name} style={styles.barRow}>
              <Text style={styles.barLabel}>{stat.icon} {stat.name}</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: (stat.totalDuration / maxDuration) * SCREEN_WIDTH * 0.6, backgroundColor: stat.colour }]} />
              </View>
              <Text style={styles.barValue}>{stat.totalDuration}h</Text>
            </View>
          ))}

          <Text style={styles.sectionHeader}>Activities by Category</Text>
          {stats.map((stat) => (
            <View key={stat.name} style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: stat.colour }]} />
              <Text style={styles.statName}>{stat.icon} {stat.name}</Text>
              <Text style={styles.statValue}>{stat.count} activities</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 60 },
  header: { fontSize: 24, fontWeight: '600', color: '#000', marginBottom: 20 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodChip: { borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  periodChipSelected: { backgroundColor: '#000', borderColor: '#000' },
  periodChipText: { fontSize: 13, color: '#000' },
  periodChipTextSelected: { color: '#fff' },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  summaryCard: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 16, alignItems: 'center' },
  summaryValue: { fontSize: 28, fontWeight: '700', color: '#000' },
  summaryLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  sectionHeader: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 12, marginTop: 8 },
  empty: { color: '#999', fontSize: 15, textAlign: 'center', marginTop: 40 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  barLabel: { fontSize: 13, color: '#000', width: 100 },
  barBackground: { flex: 1, height: 12, backgroundColor: '#eee', borderRadius: 6 },
  barFill: { height: 12, borderRadius: 6 },
  barValue: { fontSize: 13, color: '#666', width: 30, textAlign: 'right' },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statName: { flex: 1, fontSize: 14, color: '#000' },
  statValue: { fontSize: 14, color: '#666' },
});