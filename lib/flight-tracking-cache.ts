"use client"

interface CachedAircraft {
  tail_number: string
  icao24_address: string
  last_accessed: number
  access_count: number
}

interface FlightTrackingCache {
  frequently_accessed: CachedAircraft[]
  recent_searches: string[]
  favorites: string[]
}

const CACHE_KEY = 'flight_tracking_cache'
const MAX_FREQUENTLY_ACCESSED = 10
const MAX_RECENT_SEARCHES = 20
const CACHE_EXPIRY_DAYS = 30

export class FlightTrackingCacheManager {
  private cache: FlightTrackingCache

  constructor() {
    this.cache = this.loadCache()
  }

  private loadCache(): FlightTrackingCache {
    if (typeof window === 'undefined') {
      return { frequently_accessed: [], recent_searches: [], favorites: [] }
    }

    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) {
        return { frequently_accessed: [], recent_searches: [], favorites: [] }
      }

      const parsed = JSON.parse(cached)

      // Clean expired entries (older than 30 days)
      const now = Date.now()
      const expiry = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

      parsed.frequently_accessed = parsed.frequently_accessed?.filter(
        (aircraft: CachedAircraft) => (now - aircraft.last_accessed) < expiry
      ) || []

      return parsed
    } catch (error) {
      console.error('Error loading flight tracking cache:', error)
      return { frequently_accessed: [], recent_searches: [], favorites: [] }
    }
  }

  private saveCache(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache))
    } catch (error) {
      console.error('Error saving flight tracking cache:', error)
    }
  }

  // Track when an aircraft is accessed for tracking
  trackAircraftAccess(tail_number: string, icao24_address: string): void {
    const now = Date.now()

    // Update frequently accessed list
    const existing = this.cache.frequently_accessed.find(
      aircraft => aircraft.tail_number === tail_number
    )

    if (existing) {
      existing.last_accessed = now
      existing.access_count += 1
    } else {
      this.cache.frequently_accessed.push({
        tail_number,
        icao24_address,
        last_accessed: now,
        access_count: 1
      })
    }

    // Sort by access count and recent usage, keep top entries
    this.cache.frequently_accessed.sort((a, b) => {
      const scoreA = a.access_count + (now - a.last_accessed) / (24 * 60 * 60 * 1000) * -0.1
      const scoreB = b.access_count + (now - b.last_accessed) / (24 * 60 * 60 * 1000) * -0.1
      return scoreB - scoreA
    })

    if (this.cache.frequently_accessed.length > MAX_FREQUENTLY_ACCESSED) {
      this.cache.frequently_accessed = this.cache.frequently_accessed.slice(0, MAX_FREQUENTLY_ACCESSED)
    }

    // Add to recent searches if not already there
    this.addToRecentSearches(tail_number)

    this.saveCache()
  }

  // Add to recent searches
  addToRecentSearches(tail_number: string): void {
    // Remove if already exists
    this.cache.recent_searches = this.cache.recent_searches.filter(
      search => search !== tail_number
    )

    // Add to beginning
    this.cache.recent_searches.unshift(tail_number)

    // Keep only max entries
    if (this.cache.recent_searches.length > MAX_RECENT_SEARCHES) {
      this.cache.recent_searches = this.cache.recent_searches.slice(0, MAX_RECENT_SEARCHES)
    }

    this.saveCache()
  }

  // Add/remove from favorites
  toggleFavorite(tail_number: string): boolean {
    const index = this.cache.favorites.indexOf(tail_number)

    if (index >= 0) {
      this.cache.favorites.splice(index, 1)
      this.saveCache()
      return false // removed
    } else {
      this.cache.favorites.push(tail_number)
      this.saveCache()
      return true // added
    }
  }

  // Get frequently accessed aircraft
  getFrequentlyAccessed(): CachedAircraft[] {
    return [...this.cache.frequently_accessed]
  }

  // Get recent searches
  getRecentSearches(): string[] {
    return [...this.cache.recent_searches]
  }

  // Get favorites
  getFavorites(): string[] {
    return [...this.cache.favorites]
  }

  // Check if aircraft is favorited
  isFavorite(tail_number: string): boolean {
    return this.cache.favorites.includes(tail_number)
  }

  // Get quick access suggestions (combines favorites and frequently accessed)
  getQuickAccessSuggestions(): { tail_number: string; type: 'favorite' | 'frequent' | 'recent' }[] {
    const suggestions: { tail_number: string; type: 'favorite' | 'frequent' | 'recent' }[] = []

    // Add favorites first
    this.cache.favorites.forEach(tail_number => {
      suggestions.push({ tail_number, type: 'favorite' })
    })

    // Add frequently accessed (that aren't already favorites)
    this.cache.frequently_accessed
      .filter(aircraft => !this.cache.favorites.includes(aircraft.tail_number))
      .slice(0, 5)
      .forEach(aircraft => {
        suggestions.push({ tail_number: aircraft.tail_number, type: 'frequent' })
      })

    // Add recent searches (that aren't already included)
    this.cache.recent_searches
      .filter(tail_number =>
        !suggestions.some(s => s.tail_number === tail_number)
      )
      .slice(0, 3)
      .forEach(tail_number => {
        suggestions.push({ tail_number, type: 'recent' })
      })

    return suggestions
  }

  // Clear cache
  clearCache(): void {
    this.cache = { frequently_accessed: [], recent_searches: [], favorites: [] }
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
  }

  // Get cache statistics
  getCacheStats() {
    return {
      frequently_accessed_count: this.cache.frequently_accessed.length,
      recent_searches_count: this.cache.recent_searches.length,
      favorites_count: this.cache.favorites.length,
      total_access_count: this.cache.frequently_accessed.reduce(
        (sum, aircraft) => sum + aircraft.access_count, 0
      )
    }
  }
}

// Export singleton instance
export const flightTrackingCache = new FlightTrackingCacheManager()