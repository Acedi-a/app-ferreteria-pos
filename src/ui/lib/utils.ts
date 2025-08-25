import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Zona horaria de Bolivia (UTC-4)
const BOLIVIA_TIMEZONE = 'America/La_Paz';

/**
 * Obtiene la fecha y hora actual en la zona horaria de Bolivia
 */
export function getBoliviaDate(): Date {
  return new Date(new Date().toLocaleString("en-US", {timeZone: BOLIVIA_TIMEZONE}));
}

/**
 * Convierte una fecha a la zona horaria de Bolivia
 */
export function toBoliviaDate(date: Date | string): Date {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  return new Date(inputDate.toLocaleString("en-US", {timeZone: BOLIVIA_TIMEZONE}));
}

/**
 * Obtiene la fecha y hora actual en formato ISO para Bolivia
 */
export function getBoliviaISOString(): string {
  return getBoliviaDate().toISOString();
}

/**
 * Formatea una fecha en la zona horaria de Bolivia
 */
export function formatBoliviaDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: BOLIVIA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return inputDate.toLocaleString('es-ES', { ...defaultOptions, ...options });
}

/**
 * Formatea solo la fecha (sin hora) en la zona horaria de Bolivia
 */
export function formatBoliviaDateOnly(date: Date | string): string {
  return formatBoliviaDate(date, {
    timeZone: BOLIVIA_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD para Bolivia
 */
export function getBoliviaDateString(): string {
  const date = getBoliviaDate();
  return date.toISOString().split('T')[0];
}

/**
 * Obtiene una fecha hace N días en la zona horaria de Bolivia
 */
export function getBoliviaDateDaysAgo(days: number): string {
  const date = getBoliviaDate();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Formatea un número como moneda boliviana
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}