<template>
  <header class="app-header">
    <div class="container">
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/" class="brand-link">
            <h2>🌤️ Weather App</h2>
          </router-link>
        </div>
        
        <div class="nav-actions">
          <nav class="nav-menu">
            <router-link to="/" class="nav-link" exact-active-class="active">
              🏠 Dashboard
            </router-link>
            <router-link to="/projects" class="nav-link" active-class="active">
              🗺️ Projects
            </router-link>
          </nav>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style scoped>
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.brand-link {
  text-decoration: none;
  color: inherit;
}

.nav-brand h2 {
  color: #2d3436;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #636e72;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link:hover {
  color: #2d3436;
  background: rgba(116, 185, 255, 0.1);
}

.nav-link.active {
  color: #74b9ff;
  background: rgba(116, 185, 255, 0.15);
}

@media (max-width: 768px) {
  .nav-menu {
    gap: 10px;
  }
  
  .nav-link {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .nav-brand h2 {
    font-size: 1.5rem;
  }
}
</style> 