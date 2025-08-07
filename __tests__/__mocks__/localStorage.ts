// localStorage mock for testing
export const createLocalStorageMock = () => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    // Test utilities
    __getStore: () => ({ ...store }),
    __setStore: (newStore: Record<string, string>) => {
      store = { ...newStore }
    },
  }
}

export const localStorageMock = createLocalStorageMock()

// Setup localStorage mock globally
beforeEach(() => {
  localStorageMock.clear()
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  })
})