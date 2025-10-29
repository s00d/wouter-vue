<template>
  <div class="page" data-testid="users-page">
    <h1>Users</h1>
    <p class="subtitle">Select a user to view details</p>
    
    <div class="users-grid">
      <div 
        v-for="user in users" 
        :key="user.id"
        class="user-card"
      >
        <Link :href="`/users/${user.id}`" class="user-link">
          <div class="avatar">{{ user.name.charAt(0) }}</div>
          <div class="user-info">
            <h3>{{ user.name }}</h3>
            <p>{{ user.role }}</p>
          </div>
          <div class="arrow">→</div>
        </Link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Link } from 'wouter-vue';

const users = [
  { id: '1', name: 'Alice Johnson', role: 'Developer' },
  { id: '2', name: 'Bob Smith', role: 'Designer' },
  { id: '3', name: 'Charlie Brown', role: 'Manager' },
];
</script>

<style scoped>
.page {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

h1 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
}

.subtitle {
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.users-grid {
  display: grid;
  gap: 1rem;
}

.user-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.user-card:hover {
  border-color: #4f46e5;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
  transform: translateY(-2px);
}

.user-link {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  gap: 1rem;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  color: #1e293b;
  margin-bottom: 0.25rem;
  font-size: 1.2rem;
}

.user-info p {
  color: #64748b;
  font-size: 0.9rem;
}

.arrow {
  color: #4f46e5;
  font-size: 1.5rem;
  font-weight: bold;
}
</style>

