import { render } from '@testing-library/react-native';
import React from 'react';
import { TripContext } from '../app/_layout';
import IndexScreen from '../app/index';

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(JSON.stringify({ id: 1, name: 'David', email: 'david@email.com' })),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
}));

jest.mock('@/context/theme-context', () => ({
  useTheme: () => ({
    colors: {
      text: '#000',
      subtext: '#666',
      border: '#ddd',
      card: '#fff',
      background: '#fff',
      primary: '#000',
      danger: '#ff3b30',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

const mockTrip = {
  id: 1,
  name: 'Paris Summer',
  destination: 'Paris, France',
  startDate: '2026-04-14',
  endDate: '2026-04-20',
  notes: null,
  createdAt: new Date().toISOString(),
};

describe('IndexScreen', () => {
  it('renders the trips list with seeded data', () => {
    const { getByText } = render(
      <TripContext.Provider value={{ trips: [mockTrip], setTrips: jest.fn(), user: null, setUser: jest.fn() }}>
        <IndexScreen />
      </TripContext.Provider>
    );
    expect(getByText('Paris Summer')).toBeTruthy();
    expect(getByText('+ Add Trip')).toBeTruthy();
  });
});