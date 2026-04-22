import { ThemeProvider } from '@/context/theme-context';
import { db } from '@/db/client';
import { trips as tripsTable } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

// trip type used across the app
export type Trip = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
};

// context type to share trips and user state globally
type TripContextType = {
  trips: Trip[];
  setTrips: React.Dispatch<React.SetStateAction<Trip[]>>;
  user: { id: number; name: string; email: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ id: number; name: string; email: string } | null>>;
};

// create context so any screen can access trips and user
export const TripContext = createContext<TripContextType | null>(null);

export default function RootLayout() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

  // seed db and load trips on app start
  useEffect(() => {
    const init = async () => {
      try {
        await seedIfEmpty();
        const rows = await db.select().from(tripsTable);
        setTrips(rows);
      } catch (e) {
        console.log('Init error:', e);
      }
    };
    void init();
  }, []);

  // wrap app in theme and trip context providers
  return (
    <ThemeProvider>
      <TripContext.Provider value={{ trips, setTrips, user, setUser }}>
        <Stack>
          <Stack.Screen name="index" options={{ title: 'My Trips' }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
          <Stack.Screen name="add-trip" options={{ title: 'Add Trip' }} />
          <Stack.Screen name="edit-trip" options={{ title: 'Edit Trip' }} />
          <Stack.Screen name="trip-detail" options={{ title: 'Trip Details' }} />
          <Stack.Screen name="add-activity" options={{ title: 'Add Activity' }} />
          <Stack.Screen name="edit-activity" options={{ title: 'Edit Activity' }} />
          <Stack.Screen name="categories" options={{ title: 'Categories' }} />
          <Stack.Screen name="targets" options={{ title: 'Targets' }} />
          <Stack.Screen name="insights" options={{ title: 'Insights' }} />
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        </Stack>
      </TripContext.Provider>
    </ThemeProvider>
  );
}