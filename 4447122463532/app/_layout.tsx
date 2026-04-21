import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

export type Trip = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
};

type TripContextType = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
};

export const TripContext = createContext<TripContextType | null>(null);

export default function RootLayout() {
  const [trips, setTrips] = useState<Trip[]>([]);

useEffect(() => {
    const loadTrips = async () => {
      try {
        const rows = await db.select().from(tripsTable);
        setTrips(rows);
      } catch (e) {
        console.log('DB error:', e);
      }
    };
    void loadTrips();
  }, []);

  return (
    <TripContext.Provider value={{ trips, setTrips }}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'My Trips' }} />
        <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
        <Stack.Screen name="edit-trip" options={{ title: 'Edit Trip' }} />
      </Stack>
    </TripContext.Provider>
  );
}