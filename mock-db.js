// Mock database service for local development
export const db = {
  select: () => ({
    from: () => ({
      leftJoin: () => ({
        where: () => Promise.resolve([])
      })
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => Promise.resolve([{ id: 'mock-id' }])
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => Promise.resolve([{ id: 'mock-id' }])
      })
    })
  }),
  delete: () => ({
    where: () => Promise.resolve({ count: 1 })
  })
};

// Mock pool for local development
export const pool = {
  connect: () => Promise.resolve({
    release: () => {}
  }),
  query: () => Promise.resolve({ rows: [] }),
  end: () => Promise.resolve()
};