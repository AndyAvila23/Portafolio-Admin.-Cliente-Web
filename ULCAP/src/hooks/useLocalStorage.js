import { useState, useEffect } from 'react';

// Import local JSON files
import usersData from '../data/users.json';
import coursesData from '../data/courses.json';
import activityData from '../data/activity.json';
import notificationsData from '../data/notifications.json';
import inscriptionsData from '../data/inscriptions.json';
import certificatesData from '../data/certificates.json';
import categoriesData from '../data/categories.json';
import progressData from '../data/progress.json';

const getInitialData = (key) => {
  switch (key) {
    case 'users': return usersData;
    case 'courses': return coursesData;
    case 'activity': return activityData;
    case 'notifications': return notificationsData;
    case 'inscriptions': return inscriptionsData;
    case 'certificates': return certificatesData;
    case 'categories': return categoriesData;
    case 'progress': return progressData;
    default: return [];
  }
};

export const useLocalStorage = (key, initialValue = null) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (window.isViewerMode) {
        window.__viewerCache = window.__viewerCache || {};
        if (window.__viewerCache[key]) {
          return window.__viewerCache[key];
        }
      }

      const item = window.localStorage.getItem(key);
      let parsed = null;
      if (item) {
        parsed = JSON.parse(item);
      } else {
        parsed = initialValue || getInitialData(key);
        if (!window.isViewerMode) {
          window.localStorage.setItem(key, JSON.stringify(parsed));
        }
      }

      if (window.isViewerMode) {
        window.__viewerCache = window.__viewerCache || {};
        window.__viewerCache[key] = parsed;
      }
      
      return parsed;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        if (window.isViewerMode) {
          window.__viewerCache = window.__viewerCache || {};
          window.__viewerCache[key] = valueToStore;
          console.log(`[Modo Visor] Memoria actualizada para clave: ${key}`);
        } else {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
};
