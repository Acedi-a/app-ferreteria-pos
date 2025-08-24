
export function isDev(): boolean {
  return process.env.NODE_ENV === 'development';
}

// Zona horaria de Bolivia (UTC-4)
const BOLIVIA_TIMEZONE = 'America/La_Paz';

/**
 * Obtiene la fecha actual en la zona horaria de Bolivia
 */
export function getBoliviaDate(): Date {
  return new Date(new Date().toLocaleString("en-US", {timeZone: BOLIVIA_TIMEZONE}));
}

/**
 * Convierte una fecha a la zona horaria de Bolivia
 */
export function convertToBoliviaDate(inputDate: Date | string): Date {
  const date = typeof inputDate === 'string' ? new Date(inputDate) : inputDate;
  return new Date(date.toLocaleString("en-US", {timeZone: BOLIVIA_TIMEZONE}));
}

/**
 * Obtiene la fecha actual de Bolivia en formato ISO string
 */
export function getBoliviaISOString(): string {
  return getBoliviaDate().toISOString();
}

/**
 * Obtiene la fecha actual de Bolivia en formato SQLite (YYYY-MM-DD HH:MM:SS)
 */
export function getBoliviaSQLiteDateTime(): string {
  const date = getBoliviaDate();
  return date.toISOString().replace('T', ' ').substring(0, 19);
}