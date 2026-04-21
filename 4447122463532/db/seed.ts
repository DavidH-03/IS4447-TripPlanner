import { db } from './client';
import { activities, categories, targets, trips, users } from './schema';

export async function seedIfEmpty() {
  const existingTrips = await db.select().from(trips);
  if (existingTrips.length > 0) return;

  // Always insert seed user with id 1
  await db.insert(users).values({
    name: 'David',
    email: 'david@email.com',
    password: 'password123',
    createdAt: new Date().toISOString(),
  });

  await db.insert(categories).values([
    { name: 'Sightseeing', colour: '#FF6B6B', icon: '🏛️', createdAt: new Date().toISOString() },
    { name: 'Food & Drink', colour: '#4ECDC4', icon: '🍽️', createdAt: new Date().toISOString() },
    { name: 'Outdoor', colour: '#45B7D1', icon: '🥾', createdAt: new Date().toISOString() },
    { name: 'Transport', colour: '#96CEB4', icon: '🚂', createdAt: new Date().toISOString() },
    { name: 'Accommodation', colour: '#FFEAA7', icon: '🏨', createdAt: new Date().toISOString() },
  ]);

  await db.insert(trips).values([
    { userId: 1, name: 'Paris Summer', destination: 'Paris, France', startDate: '2026-04-14', endDate: '2026-04-20', notes: 'Summer holiday', createdAt: new Date().toISOString() },
    { userId: 1, name: 'Rome Weekend', destination: 'Rome, Italy', startDate: '2026-04-14', endDate: '2026-04-20', notes: 'City break', createdAt: new Date().toISOString() },
  ]);

  await db.insert(activities).values([
    { tripId: 1, categoryId: 1, name: 'Eiffel Tower', date: '2026-04-14', duration: 3, notes: 'Amazing views', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 2, name: 'Le Marais Dinner', date: '2026-04-14', duration: 2, notes: 'Great food', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 1, name: 'Louvre Museum', date: '2026-04-15', duration: 4, notes: 'Saw the Mona Lisa', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 3, name: 'Tuileries Garden Walk', date: '2026-04-16', duration: 2, notes: 'Beautiful gardens', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 2, name: 'Cafe de Flore', date: '2026-04-17', duration: 1, notes: 'Famous cafe', createdAt: new Date().toISOString() },
    { tripId: 2, categoryId: 1, name: 'Colosseum Tour', date: '2026-04-18', duration: 3, notes: 'Incredible history', createdAt: new Date().toISOString() },
    { tripId: 2, categoryId: 2, name: 'Trastevere Food Tour', date: '2026-04-19', duration: 3, notes: 'Best pasta ever', createdAt: new Date().toISOString() },
    { tripId: 2, categoryId: 3, name: 'Villa Borghese Walk', date: '2026-04-20', duration: 2, notes: 'Lovely park', createdAt: new Date().toISOString() },
  ]);

  await db.insert(targets).values([
    { userId: 1, categoryId: null, name: 'Activities per week', type: 'count', period: 'weekly', targetValue: 5, createdAt: new Date().toISOString() },
    { userId: 1, categoryId: 1, name: 'Sightseeing hours', type: 'duration', period: 'weekly', targetValue: 8, createdAt: new Date().toISOString() },
    { userId: 1, categoryId: 2, name: 'Food experiences', type: 'count', period: 'weekly', targetValue: 3, createdAt: new Date().toISOString() },
  ]);
}