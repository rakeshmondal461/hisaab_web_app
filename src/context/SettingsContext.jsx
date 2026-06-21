import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage.js';

const SettingsContext = createContext(null);

export const CURRENCIES = [
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '﷼', code: 'SAR', name: 'Saudi Riyal' },
  { symbol: 'د.إ', code: 'AED', name: 'UAE Dirham' },
];

export function SettingsProvider({ children }) {
  const saved = storage.get('settings', {});
  const [currency, setCurrencyState] = useState(saved.currency || '₹');
  const [currencyCode, setCurrencyCode] = useState(saved.currencyCode || 'INR');
  const [isDark, setIsDark] = useState(saved.isDark ?? true);

  useEffect(() => {
    storage.set('settings', { currency, currencyCode, isDark });
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [currency, currencyCode, isDark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  function setCurrency(symbol, code) { setCurrencyState(symbol); setCurrencyCode(code); }
  function toggleTheme() { setIsDark(p => !p); }

  return (
    <SettingsContext.Provider value={{ currency, currencyCode, isDark, setCurrency, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() { return useContext(SettingsContext); }
