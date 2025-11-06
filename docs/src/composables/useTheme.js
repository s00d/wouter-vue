import { ref } from 'vue';

// Глобальное состояние темы
const theme = ref('light');
let isInitialized = false;

function getInitialTheme() {
  // Проверить localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    // Проверить текущее состояние DOM (установлено скриптом в index.html)
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    // Проверить системные настройки
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
}

function applyTheme(newTheme) {
  theme.value = newTheme;
  if (typeof document !== 'undefined') {
    const html = document.documentElement;
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }
}

function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark');
}

// Инициализация темы при первом использовании
function initializeTheme() {
  if (!isInitialized && typeof window !== 'undefined') {
    const initialTheme = getInitialTheme();
    // Синхронизировать ref с текущим состоянием
    theme.value = initialTheme;
    applyTheme(initialTheme);
    isInitialized = true;
    
    // Слушать изменения системной темы
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
  }
}

// Инициализировать тему сразу, если мы в браузере
if (typeof window !== 'undefined') {
  initializeTheme();
}

export function useTheme() {
  // Инициализировать тему при первом использовании (на случай если еще не инициализирована)
  if (typeof window !== 'undefined') {
    initializeTheme();
  }
  
  return {
    theme,
    toggleTheme
  };
}

