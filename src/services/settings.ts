import { supabase } from '../lib/supabase'
import type {
  BlackoutDate,
  BusinessSettings,
  WorkingDay,
} from '../types'

export async function getBusinessSettings(): Promise<BusinessSettings | null> {
  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return (data as BusinessSettings) ?? null
}

export async function updateBusinessSettings(
  id: string,
  patch: Partial<BusinessSettings>,
): Promise<void> {
  const { error } = await supabase
    .from('business_settings')
    .update(patch)
    .eq('id', id)
  if (error) throw error
}

export async function getWorkingDays(): Promise<WorkingDay[]> {
  const { data, error } = await supabase
    .from('working_days')
    .select('*')
    .order('day_of_week')
  if (error) throw error
  return (data ?? []) as WorkingDay[]
}

export async function setWorkingDay(
  dayOfWeek: number,
  patch: Partial<Pick<WorkingDay, 'enabled' | 'opening_time' | 'closing_time'>>,
): Promise<void> {
  const { error } = await supabase
    .from('working_days')
    .update(patch)
    .eq('day_of_week', dayOfWeek)
  if (error) throw error
}

export async function getBlackoutDates(): Promise<BlackoutDate[]> {
  const { data, error } = await supabase
    .from('blackout_dates')
    .select('*')
    .gte('date', new Date().toISOString().slice(0, 10))
    .order('date')
  if (error) throw error
  return (data ?? []) as BlackoutDate[]
}

export async function addBlackoutDate(
  date: string,
  reason: string,
): Promise<void> {
  const { error } = await supabase
    .from('blackout_dates')
    .insert({ date, reason: reason.trim() || null })
  if (error) throw error
}

export async function removeBlackoutDate(id: string): Promise<void> {
  const { error } = await supabase.from('blackout_dates').delete().eq('id', id)
  if (error) throw error
}

/* ------------------------------------------------------------- availability */

export interface Availability {
  workingDays: WorkingDay[]
  blackout: Set<string>
  settings: BusinessSettings | null
}

export async function getAvailability(): Promise<Availability> {
  const [workingDays, blackoutDates, settings] = await Promise.all([
    getWorkingDays(),
    getBlackoutDates(),
    getBusinessSettings(),
  ])
  return {
    workingDays,
    blackout: new Set(blackoutDates.map((b) => b.date)),
    settings,
  }
}

/** Is a "YYYY-MM-DD" date bookable given the availability rules? */
export function isDateBookable(
  dateISO: string,
  availability: Availability,
): { ok: boolean; reason?: string } {
  const today = new Date().toISOString().slice(0, 10)
  if (dateISO < today) return { ok: false, reason: 'That date has passed.' }
  if (availability.blackout.has(dateISO))
    return { ok: false, reason: 'We are closed on that date.' }

  const [y, m, d] = dateISO.split('-').map(Number)
  const dow = new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
  const day = availability.workingDays.find((w) => w.day_of_week === dow)
  if (!day?.enabled)
    return { ok: false, reason: 'We only operate on our working days.' }

  return { ok: true }
}

/** Time slots ("09:00" … ) for a working day. */
export function timeSlotsFor(
  dateISO: string,
  availability: Availability,
): string[] {
  const [y, m, d] = dateISO.split('-').map(Number)
  const dow = new Date(y, (m ?? 1) - 1, d ?? 1).getDay()
  const day = availability.workingDays.find((w) => w.day_of_week === dow)
  const open = day?.opening_time ?? availability.settings?.opening_time ?? '09:00'
  const close =
    day?.closing_time ?? availability.settings?.closing_time ?? '20:00'
  const step = availability.settings?.booking_slot_minutes ?? 60

  const slots: string[] = []
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  let mins = oh * 60 + om
  const end = ch * 60 + cm
  while (mins < end) {
    slots.push(
      `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(
        mins % 60,
      ).padStart(2, '0')}`,
    )
    mins += step
  }
  return slots
}
