export function createMockRepository() {
  return {
    insert: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    softDelete: jest.fn(),
  };
}

export type MockRepository = ReturnType<typeof createMockRepository>;
