<template>
  <div class="page" data-testid="user-detail-page">
    <h1>User Details</h1>
    
    <div v-if="user" class="user-details">
      <div class="user-header">
        <div class="avatar-large">{{ user.name.charAt(0) }}</div>
        <div class="user-meta">
          <h2>{{ user.name }}</h2>
          <p class="role">{{ user.role }}</p>
        </div>
      </div>
      
      <div class="user-info-section">
        <div class="info-item">
          <span class="label">Email:</span>
          <span class="value">{{ user.email }}</span>
        </div>
        <div class="info-item">
          <span class="label">Location:</span>
          <span class="value">{{ user.location }}</span>
        </div>
        <div class="info-item">
          <span class="label">Bio:</span>
          <span class="value">{{ user.bio }}</span>
        </div>
      </div>
    </div>
    
    <div v-else class="not-found">
      <p>User not found</p>
    </div>
    
    <div class="nav-actions">
      <Link href="/users" class="btn-back">← Back to Users</Link>
      <Link href="/" class="btn-home">Go Home</Link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useParams, Link } from 'wouter-vue';

const params = useParams();

const users = {
  '1': { 
    name: 'Alice Johnson', 
    role: 'Developer',
    email: 'alice@example.com',
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack developer with 5+ years of experience.'
  },
  '2': { 
    name: 'Bob Smith', 
    role: 'Designer',
    email: 'bob@example.com',
    location: 'New York, NY',
    bio: 'Creative UI/UX designer focused on creating beautiful interfaces.'
  },
  '3': { 
    name: 'Charlie Brown', 
    role: 'Manager',
    email: 'charlie@example.com',
    location: 'London, UK',
    bio: 'Project manager with expertise in agile methodologies.'
  },
};

const user = computed(() => {
  const id = params.value?.id;
  return users[id];
});
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
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.user-details {
  padding: 1.5rem 0;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f1f5f9;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-meta h2 {
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.role {
  color: #64748b;
  font-size: 1.1rem;
}

.user-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
}

.label {
  font-weight: 600;
  color: #475569;
  min-width: 100px;
}

.value {
  color: #1e293b;
}

.not-found {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.nav-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-back,
.btn-home {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-back {
  background: #4f46e5;
}

.btn-back:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.btn-home {
  background: #64748b;
}

.btn-home:hover {
  background: #475569;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 116, 139, 0.4);
}
</style>

