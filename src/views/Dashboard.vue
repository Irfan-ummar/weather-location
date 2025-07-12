<template>
  <div class="dashboard-page">
    <main class="main-content">
      <div class="container">
        <div class="dashboard">
          <h1>Weather Location Dashboard</h1>
          <p>Welcome to your weather management system. Choose an option below to get started.</p>
          
          <div class="dashboard-actions">
            <div class="action-card">
              <div class="card-icon">🌤️</div>
              <h3>Check Weather</h3>
              <p>Get current weather conditions for any location using coordinates.</p>
              <button 
                class="btn btn-primary"
                @click="toggleWeatherModal"
              >
                Open Weather Tool
              </button>
            </div>
            
            <div class="action-card">
              <div class="card-icon">🗺️</div>
              <h3>Project Management</h3>
              <p>Create and manage projects with location-based weather monitoring.</p>
              <router-link to="/projects" class="btn btn-secondary">
                Manage Projects
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <WeatherModal 
      v-if="showWeatherModal" 
      @close="closeWeatherModal"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import WeatherModal from '../components/WeatherModal.vue'

export default {
  name: 'Dashboard',
  components: {
    WeatherModal
  },
  setup() {
    const showWeatherModal = ref(false)

    const toggleWeatherModal = () => {
      showWeatherModal.value = !showWeatherModal.value
    }

    const closeWeatherModal = () => {
      showWeatherModal.value = false
    }

    return {
      showWeatherModal,
      toggleWeatherModal,
      closeWeatherModal
    }
  }
}
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 80px);
}

.main-content {
  flex: 1;
  padding: 40px 0;
}

.dashboard {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 60px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.dashboard h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  color: #2d3436;
  font-weight: 700;
}

.dashboard > p {
  font-size: 1.2rem;
  color: #636e72;
  max-width: 600px;
  margin: 0 auto 40px auto;
  line-height: 1.6;
}

.dashboard-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 40px;
}

.action-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  border-color: #74b9ff;
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.action-card h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #2d3436;
}

.action-card p {
  color: #636e72;
  margin-bottom: 25px;
  line-height: 1.5;
}

.action-card .btn {
  width: 100%;
  padding: 15px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 40px 20px;
  }
  
  .dashboard h1 {
    font-size: 2rem;
  }
  
  .dashboard-actions {
    grid-template-columns: 1fr;
  }
}
</style> 