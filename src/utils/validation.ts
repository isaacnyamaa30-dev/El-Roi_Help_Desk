/** Shared form validation. Runs client-side before hitting Supabase. */

import type { NewTicketInput } from '../types'

export type Errors<T> = Partial<Record<keyof T, string>>

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export interface RegisterInput {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

export function validateRegister(input: RegisterInput): Errors<RegisterInput> {
  const errors: Errors<RegisterInput> = {}
  if (input.fullName.trim().length < 2)
    errors.fullName = 'Please enter your full name.'
  if (!isValidEmail(input.email))
    errors.email = 'Please enter a valid email address.'
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

export function validateTicket(input: NewTicketInput): Errors<NewTicketInput> {
  const errors: Errors<NewTicketInput> = {}
  if (input.title.trim().length < 5)
    errors.title = 'Title must be at least 5 characters.'
  if (input.description.trim().length < 10)
    errors.description = 'Description must be at least 10 characters.'
  if (!input.category) errors.category = 'Please choose a category.'
  if (!input.priority) errors.priority = 'Please choose a priority.'
  return errors
}

export function hasErrors<T>(errors: Errors<T>): boolean {
  return Object.keys(errors).length > 0
}
