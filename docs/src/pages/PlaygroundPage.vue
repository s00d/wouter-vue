<template>
  <div class="playground-container">
    <component
      v-if="ReplComponent && store && MonacoEditor"
      :is="ReplComponent"
      :store="store"
      :editor="MonacoEditor"
      :show-compile-output="false"
    />
    <div v-else class="loading-placeholder">
      <p>Loading Playground...</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, markRaw, shallowRef, nextTick } from 'vue';
import { useTheme } from '../composables/useTheme';

const { theme } = useTheme();
const isDark = computed(() => theme.value === 'dark');
const ReplComponent = shallowRef(null);
const MonacoEditor = shallowRef(null);
const useStoreFn = ref(null);
const useVueImportMapFn = ref(null);
const mergeImportMapFn = ref(null);

// Начальный код примера
const initialFiles = {
  'stores/counter.js': {
    code: `import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
  },
});
`
  },

  'App.vue': {
    code: `<script>
// ==========================================================
// ИСПРАВЛЕНИЕ 1: Инициализация Pinia и memoryLocation
// вынесена из <script setup> в обычный <script>.
// Это гарантирует, что они создаются один раз при загрузке модуля,
// а не при каждом создании компонента.
// ==========================================================
import { createPinia, setActivePinia } from 'pinia';
import { memoryLocation } from 'wouter-vue/memory-location';

// Инициализируем Pinia и устанавливаем его как активный
const pinia = createPinia();
setActivePinia(pinia);

// Создаем единственный экземпляр memory-роутера
const memLoc = memoryLocation({ record: true });

// ==========================================================
// ИСПРАВЛЕНИЕ 2: Хук вызывается ОДИН РАЗ,
// а фабрика хуков всегда возвращает один и тот же результат.
// ==========================================================
// Вызываем hook() один раз, чтобы получить единый для всего приложения
// экземпляр [location, navigate]
const locationTuple = memLoc.hook();

// Фабрика хуков для <Router> теперь всегда возвращает один и тот же кортеж.
// Это гарантирует, что все компоненты (Link, Route) работают с одним и тем же
// реактивным состоянием.
const locationHook = () => locationTuple;
<\/script>

<script setup>
import { Router, Route, Link } from 'wouter-vue';
import HomePage from './HomePage.vue';
import AboutPage from './AboutPage.vue';
import UserPage from './UserPage.vue';
<\/script>

<template>
  <!-- :hook="locationHook" - это правильный проп для вашей реализации -->
  <Router :hook="locationHook">
    <div class="app">
      <nav class="nav">
        <Link href="/" class="nav-link">Home</Link>
        <Link href="/about" class="nav-link">About</Link>
        <Link href="/users/123" class="nav-link">User 123</Link>
      </nav>
      
      <main class="main">
        <Route path="/">
          <HomePage />
        </Route>
        
        <Route path="/about">
          <AboutPage />
        </Route>
        
        <Route path="/users/:id">
          <UserPage />
        </Route>
      </main>
    </div>
  </Router>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.nav-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #eff6ff;
}

.main {
  padding: 1rem;
}
</style>`
  },

  'HomePage.vue': {
    code: `<template>
  <div class="page">
    <h1>Home Page</h1>
    <p>Welcome to the wouter-vue playground!</p>
    <p>Try editing the code to see how routing works.</p>
    
    <div class="counter-demo">
      <h2>Pinia Store Example</h2>
      <p>Count: {{ counter.count }}</p>
      <div class="buttons">
        <button @click="counter.increment()">+</button>
        <button @click="counter.decrement()">-</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCounterStore } from './stores/counter.js';

// Используем store - Pinia автоматически найдет активный экземпляр
const counter = useCounterStore();
<\/script>

<style scoped>
.page {
  padding: 2rem;
}

h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  line-height: 1.6;
}

.counter-demo {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.counter-demo h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #1f2937;
}

.buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.buttons button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.buttons button:hover {
  background: #2563eb;
}
</style>`
  },

  'AboutPage.vue': {
    code: `<template>
  <div class="page">
    <h1>About Page</h1>
    <p>This is the about page.</p>
    <p>You can navigate between pages using the links above.</p>
  </div>
</template>

<script setup>
<\/script>

<style scoped>
.page {
  padding: 2rem;
}

h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  line-height: 1.6;
}
</style>`
  },

  'UserPage.vue': {
    code: `<template>
  <div class="page">
    <h1>User Page</h1>
    <p>User ID: {{ params.id }}</p>
    <p>Current location: {{ location }}</p>
  </div>
</template>

<script setup>
import { useParams, useLocation } from 'wouter-vue';

const params = useParams();
const [location] = useLocation();
<\/script>

<style scoped>
.page {
  padding: 2rem;
}

h1 {
  color: #1f2937;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  line-height: 1.6;
  font-family: monospace;
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 0.25rem;
}
</style>`
  }
};

const store = ref(null);

onMounted(async () => {
  // Инициализировать store только на клиенте
  if (typeof window !== 'undefined') {
    try {
      // Подавляем ошибки консоли от volar-service (они не критичны)
      const originalError = console.error;
      const originalWarn = console.warn;
      
      console.error = (...args) => {
        // Игнорируем предупреждения о volar-service
        if (args[0] && typeof args[0] === 'string' && args[0].includes('volar-service')) {
          return;
        }
        originalError.apply(console, args);
      };
      
      console.warn = (...args) => {
        // Игнорируем предупреждения о volar-service
        if (args[0] && typeof args[0] === 'string' && args[0].includes('volar-service')) {
          return;
        }
        originalWarn.apply(console, args);
      };
      
      // Динамический импорт @vue/repl только на клиенте
      const replModule = await import('@vue/repl');
      const monacoModule = await import('@vue/repl/monaco-editor');
      await import('@vue/repl/style.css');
      
      ReplComponent.value = markRaw(replModule.Repl);
      MonacoEditor.value = markRaw(monacoModule.default);
      useStoreFn.value = replModule.useStore;
      useVueImportMapFn.value = replModule.useVueImportMap;
      mergeImportMapFn.value = replModule.mergeImportMap;
      
      // Получаем базовый import map для Vue
      const vueImportMapResult = useVueImportMapFn.value();
      
      // Создаем кастомный import map с wouter-vue и популярными библиотеками Vue
      // esm.sh автоматически обрабатывает зависимости
      const wouterVueImportMap = {
        imports: {
          'wouter-vue': 'https://esm.sh/wouter-vue@latest',
          'wouter-vue/memory-location': 'https://esm.sh/wouter-vue@latest/memory-location',
          'mitt': 'https://esm.sh/mitt@3',
          'pinia': 'https://esm.sh/pinia@2',
          '@vueuse/core': 'https://esm.sh/@vueuse/core@latest',
          '@vueuse/shared': 'https://esm.sh/@vueuse/shared@latest',
          'axios': 'https://esm.sh/axios@latest',
          'dayjs': 'https://esm.sh/dayjs@latest',
        }
      };
      
      // Создаем computed для объединения базового import map с wouter-vue
      const customImportMap = computed(() => {
        const baseMap = vueImportMapResult.importMap?.value || { imports: {} };
        return mergeImportMapFn.value(baseMap, wouterVueImportMap);
      });
      
      // Преобразуем initialFiles в формат для setFiles (строки кода)
      const filesForStore = {};
      Object.keys(initialFiles).forEach(filename => {
        filesForStore[filename] = initialFiles[filename].code;
      });
      
      // Инициализируем store (второй параметр - это hash для восстановления состояния)
      store.value = useStoreFn.value(
        {
          builtinImportMap: customImportMap,
          vueVersion: vueImportMapResult.vueVersion,
        },
        // Передаем пустую строку, чтобы не восстанавливать из hash
        ''
      );
      
      // Ждем следующего тика и небольшую задержку, чтобы store полностью инициализировался
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Устанавливаем файлы используя правильный API
      // setFiles принимает объект с ключами-именами файлов и значениями-строками кода
      // Второй параметр - это mainFile (опциональный)
      store.value.setFiles(filesForStore, 'App.vue');
      
      // Восстанавливаем оригинальные функции консоли
      setTimeout(() => {
        console.error = originalError;
        console.warn = originalWarn;
      }, 1000);
    } catch (error) {
      console.error('Failed to load Vue REPL:', error);
    }
  }
});
</script>

<style scoped>
.playground-container {
  width: 100%;
  height: 100%;
  min-height: 600px;
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-size: 1.125rem;
}
</style>

