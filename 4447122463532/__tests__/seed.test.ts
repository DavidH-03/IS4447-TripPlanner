import { db } from '../db/client';
import { seedIfEmpty } from '../db/seed';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts data when tables are empty', async () => {
    const mockValues = jest.fn().mockResolvedValue(undefined);
    const mockFrom = jest.fn().mockResolvedValue([]);
    mockDb.select.mockReturnValue({ from: mockFrom });
    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedIfEmpty();

    expect(mockDb.insert).toHaveBeenCalled();
  });

  it('does nothing when data already exists', async () => {
    const mockFrom = jest.fn().mockResolvedValue([
      { id: 1, name: 'Paris Summer', destination: 'Paris', startDate: '2026-04-14', endDate: '2026-04-20', userId: 1, createdAt: '' },
    ]);
    mockDb.select.mockReturnValue({ from: mockFrom });

    await seedIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});