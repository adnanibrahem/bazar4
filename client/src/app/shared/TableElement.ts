/* eslint-disable @typescript-eslint/no-explicit-any */
export interface TableElement {
  [key: string]: string | number;
}

export interface BackButton<T> {
  data: T[];
  selectedTab: number;
}

export function generateId(len: number) {
  const arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
}

function dec2hex(dec: any) {
  return dec.toString(16).padStart(2, '0');
}
