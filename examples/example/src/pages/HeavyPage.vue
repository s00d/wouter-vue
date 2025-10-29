<template>
  <div class="page" data-testid="heavy-page">
    <h1>Heavy Page (Async Loaded)</h1>
    <div class="badge">ASYNCHRONOUS</div>
    
    <p class="intro">This component was loaded asynchronously using <code>defineAsyncComponent</code>!</p>
    
    <div class="demo-box">
      <p><strong>Simulating a heavy component:</strong></p>
      <ul>
        <li>⚙️ Heavy computations</li>
        <li>📊 Large dependencies</li>
        <li>🎨 Complex visualizations</li>
        <li>📚 Multiple sub-components</li>
      </ul>
    </div>
    
    <div class="counter-section">
      <h2>Interactive Demo</h2>
      <p>This component is fully reactive:</p>
      <button @click="count++" class="counter-btn">
        Counter: {{ count }}
      </button>
    </div>
    
    <div class="info-box">
      <h3>How it works</h3>
      <ol>
        <li>Component is wrapped in <code>Suspense</code></li>
        <li>Loading state shows while downloading</li>
        <li>Once loaded, component renders normally</li>
        <li>Perfect for code splitting!</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Simulate network delay (1 second)
await new Promise(resolve => setTimeout(resolve, 1000));

const count = ref(0);
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
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.intro {
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 2rem;
}

code {
  background: #f1f5f9;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9rem;
  color: #4f46e5;
}

.demo-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 4px solid #4f46e5;
}

.demo-box p {
  font-weight: 600;
  color: #334155;
  margin-bottom: 1rem;
}

.demo-box ul {
  list-style: none;
  padding: 0;
}

.demo-box li {
  padding: 0.5rem 0;
  color: #475569;
  font-size: 1.1rem;
}

.counter-section {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: center;
}

.counter-section h2 {
  color: #334155;
  margin-bottom: 0.5rem;
}

.counter-section p {
  color: #64748b;
  margin-bottom: 1rem;
}

.counter-btn {
  font-size: 1.2rem;
  padding: 1rem 2rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.counter-btn:hover {
  background: #4338ca;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.info-box {
  background: #fef3c7;
  padding: 1.5rem;
  border-radius: 8px;
}

.info-box h3 {
  color: #92400e;
  margin-bottom: 1rem;
}

.info-box ol {
  color: #78350f;
  line-height: 1.8;
}

.info-box li {
  margin: 0.5rem 0;
}
</style>

