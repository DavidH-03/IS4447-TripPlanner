import { useTheme } from '@/context/theme-context';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChange: (date: string) => void;
};

export default function DatePicker({ label, value, onChange }: Props) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  const date = value ? new Date(value) : new Date();

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      const formatted = selectedDate.toISOString().split('T')[0];
      onChange(formatted);
    }
  };

  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return 'Select date';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={() => setShow(true)}
      >
        <Text style={[styles.buttonText, { color: value ? colors.text : colors.subtext }]}>
          {formatDisplay(value)}
        </Text>
      </TouchableOpacity>
      {show && (
        <RNDateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  button: { borderWidth: 1, borderRadius: 8, padding: 12 },
  buttonText: { fontSize: 15 },
});