import { useTheme } from '@/context/theme-context';
import { db } from '@/db/client';
import { activities as activitiesTable, categories as categoriesTable } from '@/db/schema';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
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
  const { colors } = useTheme();
  const [stats, setStats] = useState<CategoryStat[]>([]);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');
  const [totalHours, setTotalHours] = useState(0);
  const [totalActivities, setTotalActivities] = useState(0);
  const [streak, setStreak] = useState(0);

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
    const s = await calculateStreak();
  setStreak(s);
  };
  
  const exportCSV = async () => {
    const allActivities = await db.select().from(activitiesTable);
    const allCategories = await db.select().from(categoriesTable);
    const header = 'Name,Date,Duration (hrs),Category,Notes\n';
    const rows = allActivities.map(a => {
      const cat = allCategories.find(c => c.id === a.categoryId);
      return `"${a.name}","${a.date}","${a.duration}","${cat?.name || 'Unknown'}","${a.notes || ''}"`;
    }).join('\n');
    const csv = header + rows;
    const fileUri = FileSystem.documentDirectory + 'activities.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' });
    await Sharing.shareAsync(fileUri);
  };

const calculateStreak = async () => {
  const allActivities = await db.select().from(activitiesTable);
  const dates = [...new Set(allActivities.map(a => a.date))].sort();
  if (dates.length === 0) return 0;
  let streak = 1;
  let maxStreak = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }
  return maxStreak;
};

  const maxDuration = Math.max(...stats.map(s => s.totalDuration), 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>Insights</Text>

      <View style={styles.periodRow}>
        {(['weekly', 'monthly', 'all'] as const).map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.periodChip, { borderColor: colors.border }, period === p && styles.periodChipSelected]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.periodChipText, { color: colors.text }, period === p && styles.periodChipTextSelected]}>
              {p === 'weekly' ? 'This Week' : p === 'monthly' ? 'This Month' : 'All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.summaryRow}>
  <View style={[styles.summaryCard, { borderColor: colors.border }]}>
    <Text style={[styles.summaryValue, { color: colors.text }]}>{totalActivities}</Text>
    <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Activities</Text>
  </View>
  <View style={[styles.summaryCard, { borderColor: colors.border }]}>
    <Text style={[styles.summaryValue, { color: colors.text }]}>{totalHours.toFixed(1)}</Text>
    <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Hours</Text>
  </View>
  <View style={[styles.summaryCard, { borderColor: colors.border }]}>
    <Text style={[styles.summaryValue, { color: colors.text }]}>{streak}</Text>
    <Text style={[styles.summaryLabel, { color: colors.subtext }]}>Day Streak 🔥</Text>
  </View>
</View>
      

      {stats.length === 0 ? (
        <Text style={[styles.empty, { color: colors.subtext }]}>No activities for this period.</Text>
      ) : (
        <>
          <Text style={[styles.sectionHeader, { color: colors.text }]}>Hours by Category</Text>
          {stats.map((stat) => (
            <View key={stat.name} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: colors.text }]}>{stat.icon} {stat.name}</Text>
              <View style={[styles.barBackground, { backgroundColor: colors.border }]}>
                <View style={[styles.barFill, { width: (stat.totalDuration / maxDuration) * SCREEN_WIDTH * 0.6, backgroundColor: stat.colour }]} />
              </View>
              <Text style={[styles.barValue, { color: colors.subtext }]}>{stat.totalDuration}h</Text>
            </View>
          ))}

          <Text style={[styles.sectionHeader, { color: colors.text }]}>Activities by Category</Text>
          {stats.map((stat) => (
            <View key={stat.name} style={[styles.statRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.dot, { backgroundColor: stat.colour }]} />
              <Text style={[styles.statName, { color: colors.text }]}>{stat.icon} {stat.name}</Text>
              <Text style={[styles.statValue, { color: colors.subtext }]}>{stat.count} activities</Text>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity style={[styles.exportButton, { backgroundColor: colors.primary }]} onPress={exportCSV}>
        <Text style={[styles.exportButtonText, { color: colors.background }]}>Export CSV</Text>
      </TouchableOpacity>
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
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
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
  exportButton: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 16, marginBottom: 32 },
  exportButtonText: { fontSize: 15, fontWeight: '600' },
});