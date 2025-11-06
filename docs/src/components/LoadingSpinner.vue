<template>
  <div class="spinner-container">
    <div class="spinner">
      <div class="loading">Loading...</div>
    </div>
  </div>
</template>

<style scoped>
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  text-align: center;
}

.loading {
  font-size: 1.2rem;
  color: #4f46e5;
  animation: pulse 1.5s ease-in-out infinite;
}

:global(.dark) .loading {
  color: #818cf8;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

