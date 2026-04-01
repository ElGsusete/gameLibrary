import '@testing-library/jest-dom/vitest'

// jsdom 28 cambió la implementación de localStorage — proveemos una versión compatible
const storageFactory = (): Storage => {
  const data: Record<string, string> = {}
  return {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => { data[key] = String(value) },
    removeItem: (key: string) => { delete data[key] },
    clear: () => { Object.keys(data).forEach((k) => delete data[k]) },
    get length() { return Object.keys(data).length },
    key: (i: number) => Object.keys(data)[i] ?? null,
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  value: storageFactory(),
  writable: true,
  configurable: true,
})
