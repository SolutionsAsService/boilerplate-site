import riversJson from '../data/rivers.json'
import tripsJson from '../data/trips.json'
import type { River, Trip } from './model'

export const FLOW = riversJson.flow
export const RIVERS = riversJson.rivers as River[]
export const TRIPS = tripsJson.trips as Trip[]
export const TIERS = tripsJson.discount
export const DEPOSIT_PCT = tripsJson.depositPct
export const riverById = (id: string): River => RIVERS.filter((r) => r.id === id)[0]
export const tripBySlug = (slug: string): Trip | undefined => TRIPS.filter((t) => t.slug === slug)[0]
export const SITE = { name: 'Gauge Rafting', tagline: 'Whitewater where the river level decides the trip', email: 'trips@gauge-rafting.example' }
