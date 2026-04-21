import { db } from './client';
import { activities, categories, targets, trips, users } from './schema';

export async function seedIfEmpty() {
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) return;

  // Users
  await db.insert(users).values([
    {
      name: 'David',
      email: 'david@email.com',
      password: 'password123',
      createdAt: new Date().toISOString(),
    },
  ]);

  // Categories
  await db.insert(categories).values([
    { name: 'Sightseeing', colour: '#FF6B6B', icon: '🏛️', createdAt: new Date().toISOString() },
    { name: 'Food & Drink', colour: '#4ECDC4', icon: '🍽️', createdAt: new Date().toISOString() },
    { name: 'Outdoor', colour: '#45B7D1', icon: '🥾', createdAt: new Date().toISOString() },
    { name: 'Transport', colour: '#96CEB4', icon: '🚂', createdAt: new Date().toISOString() },
    { name: 'Accommodation', colour: '#FFEAA7', icon: '🏨', createdAt: new Date().toISOString() },
  ]);

  // Trips
  await db.insert(trips).values([
    { userId: 1, name: 'Paris Summer', destination: 'Paris, France', startDate: '2025-06-01', endDate: '2025-06-07', notes: 'Summer holiday', createdAt: new Date().toISOString() },
    { userId: 1, name: 'Rome Weekend', destination: 'Rome, Italy', startDate: '2025-08-10', endDate: '2025-08-14', notes: 'City break', createdAt: new Date().toISOString() },
  ]);

  // Activities
  await db.insert(activities).values([
    { tripId: 1, categoryId: 1, name: 'Eiffel Tower', date: '2025-06-01', duration: 3, notes: 'Amazing views', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 2, name: 'Le Marais Dinner', date: '2025-06-01', duration: 2, notes: 'Great food', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 1, name: 'Louvre Museum', date: '2025-06-02', duration: 4, notes: 'Saw the Mona Lisa', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 3, name: 'Tuileries Garden Walk', date: '2025-06-03', duration: 2, notes: 'Beautiful gardens', createdAt: new Date().toISOString() },
    { tripId: 1, categoryId: 2, name: 'Cafe de Flore', date: '2025-06-04', duration: 1, notes: 'Famous cafe', createdAt: new Date().toISOString() },
    { tripId: 2, categoryId: 1, name: 'Colosseum Tour', date: '2025-08-10', duration: 3, notes: 'Incredible history', createdAt: new Date().toISOString() },
    { tripId: 2, categoryId: 2, name: 'Trastevere Food Tour', date: '2025-08-11', duration: 3, notes: 'Best pasta ever', createdAt: new Date().toISOString() },
    { tripId: 2, categoryId: 3, name: 'Villa Borghese Walk', date: '2025-08-12', duration: 2, notes: 'Lovely park', createdAt: new Date().toISOString() },
  ]);

  // Targets
  await db.insert(targets).values([
    { userId: 1, categoryId: null, name: 'Activities per week', type: 'count', period: 'weekly', targetValue: 5, createdAt: new Date().toISOString() },
    { userId: 1, categoryId: 1, name: 'Sightseeing hours', type: 'duration', period: 'weekly', targetValue: 8, createdAt: new Date().toISOString() },
    { userId: 1, categoryId: 2, name: 'Food experiences', type: 'count', period: 'weekly', targetValue: 3, createdAt: new Date().toISOString() },
  ]);
}