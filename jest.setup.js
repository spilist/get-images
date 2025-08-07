// Jest DOM matchers
import '@testing-library/jest-dom'

// Mock Next.js router
import { jest } from '@jest/globals'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next/headers for API routes
jest.mock('next/headers', () => ({
  headers: () => new Map(),
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))

// Mock NextRequest and NextResponse for API route testing
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.body = init.body || null
      this._json = null
      
      // If body is provided and it's JSON, parse and store it
      if (this.body && typeof this.body === 'string') {
        try {
          this._json = JSON.parse(this.body)
        } catch (e) {
          // Not JSON, ignore
        }
      }
    }
    
    async json() {
      if (this._json) return this._json
      if (this.body) {
        try {
          return JSON.parse(this.body)
        } catch (e) {
          throw new Error('Invalid JSON')
        }
      }
      throw new Error('No body')
    }
  },
  
  NextResponse: class NextResponse extends globalThis.Response {
    constructor(body, init = {}) {
      super(body, init)
    }
    
    static json(data, init = {}) {
      const body = JSON.stringify(data)
      return new globalThis.Response(body, {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers
        }
      })
    }
    
    static redirect(url, init = {}) {
      return new globalThis.Response(null, {
        status: init.status || 302,
        headers: {
          'location': url,
          ...init.headers
        }
      })
    }
  }
}))

// Global test environment setup
require('jest-fetch-mock').enableMocks()

// Mock localStorage - only in browser environments
if (typeof window !== 'undefined') {
  const localStorageMock = (() => {
    let store = {}
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => {
        store[key] = value.toString()
      },
      removeItem: (key) => {
        delete store[key]
      },
      clear: () => {
        store = {}
      },
      get length() {
        return Object.keys(store).length
      },
      key: (index) => {
        const keys = Object.keys(store)
        return keys[index] || null
      }
    }
  })()

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  })
}

// Note: window.location mocking is handled per-test as needed

// Mock window.alert and console methods for cleaner test output
if (typeof window !== 'undefined') {
  global.alert = jest.fn()
}

global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
}

// Add Node.js polyfills for MSW Web APIs
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = require('util').TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = require('util').TextDecoder
}

// Add TransformStream polyfill for MSW v2
if (typeof globalThis.TransformStream === 'undefined') {
  const { TransformStream } = require('node:stream/web')
  globalThis.TransformStream = TransformStream
}

// Add ReadableStream polyfill
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream } = require('node:stream/web')
  globalThis.ReadableStream = ReadableStream
}

// Add WritableStream polyfill
if (typeof globalThis.WritableStream === 'undefined') {
  const { WritableStream } = require('node:stream/web')
  globalThis.WritableStream = WritableStream
}

// Add CompressionStream polyfill (used by MSW)
if (typeof globalThis.CompressionStream === 'undefined') {
  // Mock CompressionStream since it's not available in older Node versions
  globalThis.CompressionStream = class CompressionStream {
    constructor(format) {
      this.format = format
      this.readable = new globalThis.ReadableStream()
      this.writable = new globalThis.WritableStream()
    }
  }
}

// Add DecompressionStream polyfill (used by MSW)
if (typeof globalThis.DecompressionStream === 'undefined') {
  // Mock DecompressionStream since it's not available in older Node versions
  globalThis.DecompressionStream = class DecompressionStream {
    constructor(format) {
      this.format = format
      this.readable = new globalThis.ReadableStream()
      this.writable = new globalThis.WritableStream()
    }
  }
}

// Add BroadcastChannel polyfill for MSW WebSocket support
if (typeof globalThis.BroadcastChannel === 'undefined') {
  globalThis.BroadcastChannel = class BroadcastChannel {
    constructor(name) {
      this.name = name
      this.onmessage = null
      this.onmessageerror = null
    }
    
    postMessage(message) {
      // Mock implementation - in real use this would broadcast to other channels with same name
    }
    
    close() {
      // Mock implementation
    }
    
    addEventListener(type, listener) {
      if (type === 'message') {
        this.onmessage = listener
      } else if (type === 'messageerror') {
        this.onmessageerror = listener
      }
    }
    
    removeEventListener(type, listener) {
      if (type === 'message' && this.onmessage === listener) {
        this.onmessage = null
      } else if (type === 'messageerror' && this.onmessageerror === listener) {
        this.onmessageerror = null
      }
    }
  }
}

// Mock Next.js Request and Response objects for API route testing
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = class Request {
    constructor(input, init = {}) {
      this.url = typeof input === 'string' ? input : input.url
      this.method = init.method || 'GET'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.body = init.body || null
      this._json = null
      
      // If body is provided and it's JSON, parse and store it
      if (this.body && typeof this.body === 'string') {
        try {
          this._json = JSON.parse(this.body)
        } catch (e) {
          // Not JSON, ignore
        }
      }
    }
    
    async json() {
      if (this._json) return this._json
      if (this.body) {
        try {
          return JSON.parse(this.body)
        } catch (e) {
          throw new Error('Invalid JSON')
        }
      }
      throw new Error('No body')
    }
  }
}

if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = class Response {
    constructor(body, init = {}) {
      this.body = body
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Map(Object.entries(init.headers || {}))
      this.ok = this.status >= 200 && this.status < 300
    }
    
    static json(data, init = {}) {
      const body = JSON.stringify(data)
      return new Response(body, {
        ...init,
        headers: {
          'content-type': 'application/json',
          ...init.headers
        }
      })
    }
    
    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }
    
    async text() {
      return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
    }
  }
}

// Set up timezone for consistent test results
process.env.TZ = 'UTC'

// Increase timeout for async operations
jest.setTimeout(10000)