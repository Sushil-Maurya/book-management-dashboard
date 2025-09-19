import axios, { AxiosError } from "axios"

// CrudCrud key rotation utility. Works in browser (client components) and Node.
// Configure keys via env: NEXT_PUBLIC_CRUDCRUD_KEYS="key1,key2,key3"
// Or at runtime via localStorage key: crudcrud_keys (comma-separated).
// We rotate to the next key when:
// - a request returns 429 (rate limit) or 403 (expired/invalid key)
// - optional soft limit of 100 hits per key (CrudCrud free plan)

const LS_KEYS = {
  keys: "crudcrud_keys",
  idx: "crudcrud_idx",
  hits: "crudcrud_hits",
  migrated: "crudcrud_migrated",
  endpoints: "crudcrud_endpoints"
}

// Define the endpoints that should be migrated
const MIGRATE_ENDPOINTS = ['/books', '/members', '/history']

function readKeys(): string[] {
  // 1) localStorage override
  if (typeof window !== "undefined") {
    const fromLs = window.localStorage.getItem(LS_KEYS.keys)
    if (fromLs) {
      return fromLs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }
  // 2) env
  const fromEnv = process.env.NEXT_PUBLIC_CRUDCRUD_KEYS
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }
  // 3) fallback: single hardcoded key (last used). Update this as needed.
  return ["9e96800dde894c34a47a7d602bbff73e"]
}

function readIndex(max: number): number {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(LS_KEYS.idx)
  const idx = raw ? parseInt(raw, 10) : 0
  return isNaN(idx) ? 0 : Math.min(Math.max(idx, 0), Math.max(0, max - 1))
}

function writeIndex(idx: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LS_KEYS.idx, String(idx))
}

function readHits(): number {
  if (typeof window === "undefined") return 0
  const raw = window.localStorage.getItem(LS_KEYS.hits)
  const hits = raw ? parseInt(raw, 10) : 0
  return isNaN(hits) ? 0 : hits
}

function writeHits(h: number) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(LS_KEYS.hits, String(h))
}

function resetHits() {
  writeHits(0)
}

export function rotateKey(keysCount: number): void {
  const currentIdx = readIndex(keysCount)
  const nextIdx = (currentIdx + 1) % keysCount
  
  // Store current index as previous before updating
  localStorage.setItem('crudcrud_prev_idx', String(currentIdx))
  localStorage.setItem(LS_KEYS.idx, String(nextIdx))
  localStorage.setItem(LS_KEYS.hits, '0')
  
  // Get keys for migration
  const keys = readKeys()
  const fromKey = keys[currentIdx]
  const toKey = keys[nextIdx]
  
  // Start migration in background
  if (fromKey && toKey) {
    migrateData(fromKey, toKey).catch(console.error)
  }
}

export function getBaseUrl(key?: string): string {
  if (key) {
    return `https://crudcrud.com/api/${key}`
  }
  const keys = readKeys()
  const idx = readIndex(keys.length)
  const currentKey = keys[idx]
  return `https://crudcrud.com/api/${currentKey}`
}

export function getCurrentKey(): string {
  const keys = readKeys()
  const idx = readIndex(keys.length)
  return keys[idx]
}

export function getPreviousKey(): string | null {
  const keys = readKeys()
  const prevIdx = localStorage.getItem('crudcrud_prev_idx')
  return prevIdx ? keys[parseInt(prevIdx, 10)] : null
}

async function migrateData(fromKey: string, toKey: string) {
  try {
    const migrated = localStorage.getItem(LS_KEYS.migrated)
    const migratedData = migrated ? JSON.parse(migrated) : {}
    
    if (migratedData[`${fromKey}_to_${toKey}`]) {
      return // Already migrated
    }

    console.log(`Migrating data from key ${fromKey} to ${toKey}...`)
    
    const endpoints = MIGRATE_ENDPOINTS
    let success = true
    
    for (const endpoint of endpoints) {
      try {
        // Get data from old key
        const fromUrl = `${getBaseUrl(fromKey)}${endpoint}`
        const response = await axios.get(fromUrl)
        const items = response.data || []
        
        if (items.length === 0) continue
        
        // Post to new key
        const toUrl = `${getBaseUrl(toKey)}${endpoint}`
        
        // Create items in the new endpoint
        for (const item of items) {
          await axios.post(toUrl, item)
        }
        
        console.log(`Migrated ${items.length} items from ${endpoint}`)
      } catch (error) {
        console.error(`Error migrating ${endpoint}:`, error)
        success = false
      }
    }
    
    if (success) {
      // Mark this migration as complete
      migratedData[`${fromKey}_to_${toKey}`] = Date.now()
      localStorage.setItem(LS_KEYS.migrated, JSON.stringify(migratedData))
      console.log('Migration completed successfully')
    }
  } catch (error) {
    console.error('Error during migration:', error)
  }
}

async function handleRateLimitOrRotate<T>(err: unknown, keysCount: number): Promise<never> {
  const isAxios = axios.isAxiosError(err)
  const status = isAxios ? err.response?.status : undefined
  if (status === 429 || status === 403) {
    // rotate and throw to allow caller to retry
    rotateKey(keysCount)
  }
  throw err as any
}

export async function requestWithRotation<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
  const keys = readKeys()
  const idx = readIndex(keys.length)
  const key = keys[idx]

  // Soft quota: rotate after 100 hits on current key
  const hits = readHits()
  if (hits >= 100) {
    rotateKey(keys.length)
  }

  const base = getBaseUrl()
  try {
    const result = await fn(base)
    writeHits(readHits() + 1)
    return result
  } catch (err) {
    try {
      await handleRateLimitOrRotate(err, keys.length)
    } catch (rotated) {
      // If rotation happened, attempt one retry with new base
      if (axios.isAxiosError(err) && (err.response?.status === 429 || err.response?.status === 403)) {
        const retryBase = getBaseUrl()
        try {
          const result = await fn(retryBase)
          writeHits(readHits() + 1)
          return result
        } catch (e2) {
          throw e2
        }
      }
      throw rotated
    }
  }
  // This point should be unreachable because we either returned a result or threw an error above.
  throw new Error("requestWithRotation: unreachable path")
}
