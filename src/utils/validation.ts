/** Shared form validation. Runs client-side before hitting Supabase. */

import type { NewBookingInput } from '../types'

export type Errors<T> = Partial<Record<keyof T, string>>

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/** Ghana numbers: 0XXXXXXXXX or +233XXXXXXXXX (9 digits after the prefix). */
export function isValidPhone(phone: string): boolean {
  const p = phone.replace(/[\s-]/g, '')
  return /^(?:\+233|0)\d{9}$/.test(p)
}

export function hasErrors<T>(errors: Errors<T>): boolean {
  return Object.keys(errors).length > 0
}

/* --------------------------------------------------------------- auth forms */

export interface RegisterInput {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export function validateRegister(input: RegisterInput): Errors<RegisterInput> {
  const errors: Errors<RegisterInput> = {}
  if (input.fullName.trim().length < 2)
    errors.fullName = 'Please enter your full name.'
  if (!isValidEmail(input.email))
    errors.email = 'Please enter a valid email address.'
  if (!isValidPhone(input.phone))
    errors.phone = 'Enter a valid Ghana phone number, e.g. 0241234567.'
  if (input.password.length < 8)
    errors.password = 'Password must be at least 8 characters.'
  if (input.password !== input.confirmPassword)
    errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export function validateLogin(input: {
  email: string
  password: string
}): Errors<{ email: string; password: string }> {
  const errors: Errors<{ email: string; password: string }> = {}
  if (!isValidEmail(input.email))
    errors.email = 'Please enter a valid email address.'
  if (!input.password) errors.password = 'Please enter your password.'
  return errors
}

/* ------------------------------------------------------------- booking form */

export function validateBooking(
  input: NewBookingInput,
): Errors<NewBookingInput> {
  const errors: Errors<NewBookingInput> = {}
  if (!input.service_id) errors.service_id = 'Please choose a service.'
  if (!input.service_date) errors.service_date = 'Please choose a date.'
  if (!input.service_time) errors.service_time = 'Please choose a time.'
  if (input.service_location.trim().length < 3)
    errors.service_location = 'Please enter the service location.'
  if (!isValidPhone(input.client_phone))
    errors.client_phone = 'Enter a valid Ghana phone number.'
  return errors
}
