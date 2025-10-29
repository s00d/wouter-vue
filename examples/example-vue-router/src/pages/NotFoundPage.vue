<template>
  <div class="page error">
    <div class="error-icon">404</div>
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    
    <div class="actions">
      <router-link to="/" class="btn-primary">Go Home</router-link>
      <button @click="goBack" class="btn-secondary">Go Back</button>
    </div>
  </div>
</template>

<script setup>
const goBack = () => {
  if (typeof window !== 'undefined' && window.history) {
    window.history.back();
  }
};
</script>

<style scoped>
.page.error {
  text-align: center;
  padding: 4rem 2rem;
}

.error-icon {
  font-size: 8rem;
  font-weight: bold;
  color: #f1f5f9;
  margin-bottom: 1rem;
  line-height: 1;
}

h1 {
  color: #1e293b;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #64748b;
  font-size: 1.1rem;
  margin-bottom: 3rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.btn-secondary {
  background: #e2e8f0;
  color: #334155;
}

.btn-secondary:hover {
  background: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(203, 213, 225, 0.4);
}
</style>

