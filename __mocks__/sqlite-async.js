// __mocks__/sqlite-async.js

export const Database = {
    open: jest.fn(() => Promise.resolve({
        run: jest.fn(() => Promise.resolve({ lastID: 1 })),
        all: jest.fn(() => Promise.resolve([])),
        close: jest.fn(() => Promise.resolve())
    }))
}
  