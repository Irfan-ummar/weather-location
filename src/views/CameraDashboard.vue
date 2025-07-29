<template>
  <div class="camera-dashboard-page">
    <div class="container">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>📹 Camera Dashboard</h1>
          <p>Manage your camera system and monitor all locations</p>
        </div>
        <div class="header-actions">
          <router-link to="/cameras/setup" class="btn btn-primary">
            ➕ Add New Setup
          </router-link>
        </div>
      </div>

      <!-- Camera Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📹</div>
          <div class="stat-content">
            <h3>{{ totalCameras }}</h3>
            <p>Total Cameras</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🟢</div>
          <div class="stat-content">
            <h3>{{ onlineCameras }}</h3>
            <p>Online</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🔴</div>
          <div class="stat-content">
            <h3>{{ offlineCameras }}</h3>
            <p>Offline</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🗺️</div>
          <div class="stat-content">
            <h3>{{ floorPlans.length }}</h3>
            <p>Floor Plans</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="floorPlans.length === 0" class="empty-state">
        <div class="empty-icon">📹</div>
        <h2>No Camera Setup Found</h2>
        <p>Get started by setting up your first camera system</p>
        <router-link to="/cameras/setup" class="btn btn-primary">
          Set Up Cameras
        </router-link>
      </div>

      <!-- Floor Plans Grid -->
      <div v-else class="floor-plans-grid">
        <div 
          v-for="floorPlan in floorPlans" 
          :key="floorPlan.id"
          class="floor-plan-card"
        >
          <div class="floor-plan-header">
            <h3>{{ floorPlan.name }}</h3>
            <div class="plan-actions">
              <button 
                class="btn-icon" 
                @click="editFloorPlan(floorPlan)"
                title="Edit floor plan"
              >
                ✏️
              </button>
              <button 
                class="btn-icon btn-danger" 
                @click="confirmDeleteFloorPlan(floorPlan)"
                title="Delete floor plan"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="floor-plan-preview" @click="selectFloorPlan(floorPlan.id)">
            <img :src="floorPlan.imageUrl" :alt="floorPlan.name" />
            <div class="camera-overlay">
              <div 
                v-for="camera in getCamerasByFloorPlan(floorPlan.id)"
                :key="camera.id"
                class="camera-marker"
                :style="{ 
                  left: (camera.x / floorPlan.width * 100) + '%', 
                  top: (camera.y / floorPlan.height * 100) + '%' 
                }"
                :class="{ 
                  online: camera.status === 'online',
                  offline: camera.status === 'offline',
                  maintenance: camera.status === 'maintenance'
                }"
                @click.stop="goToCamera(camera.id)"
                :title="camera.name"
              >
                📹
              </div>
            </div>
          </div>

          <div class="floor-plan-info">
            <div class="plan-stats">
              <span class="stat">
                📹 {{ getCamerasByFloorPlan(floorPlan.id).length }} cameras
              </span>
              <span class="stat">
                🟢 {{ getCamerasByFloorPlan(floorPlan.id).filter(c => c.status === 'online').length }} online
              </span>
            </div>
            <div class="plan-type">
              {{ floorPlan.type === 'upload' ? '📁 Uploaded' : '🗺️ Map Snapshot' }}
            </div>
          </div>

          <!-- Camera List -->
          <div class="cameras-list">
            <h4>Cameras ({{ getCamerasByFloorPlan(floorPlan.id).length }})</h4>
            <div class="camera-items">
              <div 
                v-for="camera in getCamerasByFloorPlan(floorPlan.id)"
                :key="camera.id"
                class="camera-item"
                @click="goToCamera(camera.id)"
              >
                <div class="camera-status" :class="camera.status"></div>
                <div class="camera-details">
                  <span class="camera-name">{{ camera.name }}</span>
                  <span class="camera-type">{{ camera.type }}</span>
                </div>
                <div class="camera-actions">
                  <button 
                    class="btn-small" 
                    @click.stop="toggleCameraStatus(camera.id)"
                    :class="camera.status === 'online' ? 'btn-danger' : 'btn-success'"
                  >
                    {{ camera.status === 'online' ? 'Offline' : 'Online' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Floor Plan Modal -->
      <div v-if="selectedFloorPlan" class="modal-overlay" @click="closeFloorPlanModal">
        <div class="modal-content large" @click.stop>
          <div class="modal-header">
            <h2>{{ selectedFloorPlan.name }}</h2>
            <button class="btn-close" @click="closeFloorPlanModal">×</button>
          </div>
          <div class="modal-body">
            <div class="full-floor-plan">
              <img :src="selectedFloorPlan.imageUrl" :alt="selectedFloorPlan.name" />
              <div class="camera-overlay">
                <div 
                  v-for="camera in getCamerasByFloorPlan(selectedFloorPlan.id)"
                  :key="camera.id"
                  class="camera-marker large"
                  :style="{ left: camera.x + 'px', top: camera.y + 'px' }"
                  :class="{ 
                    online: camera.status === 'online',
                    offline: camera.status === 'offline',
                    maintenance: camera.status === 'maintenance'
                  }"
                  @click="goToCamera(camera.id)"
                >
                  <div class="camera-icon">📹</div>
                  <div class="camera-tooltip">
                    <strong>{{ camera.name }}</strong><br>
                    Status: {{ camera.status }}<br>
                    Type: {{ camera.type }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="floorPlanToDelete" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Confirm Delete</h2>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete "{{ floorPlanToDelete.name }}"?</p>
            <p class="warning">This will also delete all {{ getCamerasByFloorPlan(floorPlanToDelete.id).length }} cameras associated with this floor plan.</p>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="cancelDelete">Cancel</button>
            <button class="btn btn-danger" @click="deleteFloorPlan">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCameras } from '../composables/useCameras.js'

export default {
  name: 'CameraDashboard',
  setup() {
    const router = useRouter()
    const {
      cameras,
      floorPlans,
      selectedFloorPlan,
      getCamerasByFloorPlan,
      selectFloorPlan,
      removeFloorPlan,
      updateCamera,
      totalCameras,
      onlineCameras,
      offlineCameras
    } = useCameras()

    // Local state
    const floorPlanToDelete = ref(null)

    // Methods
    const goToCamera = (cameraId) => {
      router.push(`/camera/${cameraId}`)
    }

    const editFloorPlan = (floorPlan) => {
      // For now, just redirect to setup. In a real app, you'd have an edit mode
      router.push('/cameras/setup')
    }

    const confirmDeleteFloorPlan = (floorPlan) => {
      floorPlanToDelete.value = floorPlan
    }

    const deleteFloorPlan = () => {
      if (floorPlanToDelete.value) {
        removeFloorPlan(floorPlanToDelete.value.id)
        floorPlanToDelete.value = null
      }
    }

    const cancelDelete = () => {
      floorPlanToDelete.value = null
    }

    const closeFloorPlanModal = () => {
      selectedFloorPlan.value = null
    }

    const toggleCameraStatus = (cameraId) => {
      const camera = cameras.value.find(c => c.id === cameraId)
      if (camera) {
        const newStatus = camera.status === 'online' ? 'offline' : 'online'
        updateCamera(cameraId, { status: newStatus })
      }
    }

    return {
      cameras,
      floorPlans,
      selectedFloorPlan,
      floorPlanToDelete,
      totalCameras,
      onlineCameras,
      offlineCameras,
      getCamerasByFloorPlan,
      selectFloorPlan,
      goToCamera,
      editFloorPlan,
      confirmDeleteFloorPlan,
      deleteFloorPlan,
      cancelDelete,
      closeFloorPlanModal,
      toggleCameraStatus
    }
  }
}
</script>

<style scoped>
.camera-dashboard-page {
  min-height: calc(100vh - 80px);
  padding: 40px 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-content h1 {
  font-size: 2.5rem;
  color: #2d3436;
  margin: 0 0 10px 0;
}

.header-content p {
  color: #636e72;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0 0 5px 0;
  color: #2d3436;
}

.stat-content p {
  margin: 0;
  color: #636e72;
}

.empty-state {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 80px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 30px;
}

.empty-state h2 {
  font-size: 2rem;
  color: #2d3436;
  margin-bottom: 15px;
}

.floor-plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.floor-plan-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.floor-plan-card:hover {
  transform: translateY(-5px);
}

.floor-plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(116, 185, 255, 0.1);
}

.floor-plan-header h3 {
  margin: 0;
  color: #2d3436;
}

.plan-actions {
  display: flex;
  gap: 10px;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  transition: background 0.2s ease;
}

.btn-icon:hover {
  background: rgba(0, 0, 0, 0.1);
}

.btn-danger:hover {
  background: rgba(255, 118, 117, 0.2);
}

.floor-plan-preview {
  position: relative;
  cursor: pointer;
  height: 250px;
  overflow: hidden;
}

.floor-plan-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.camera-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  background: rgba(116, 185, 255, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-marker:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.camera-marker.online {
  background: rgba(0, 184, 148, 0.9);
}

.camera-marker.offline {
  background: rgba(255, 118, 117, 0.9);
}

.camera-marker.maintenance {
  background: rgba(253, 203, 110, 0.9);
}

.camera-marker.large {
  width: 40px;
  height: 40px;
  font-size: 16px;
  position: relative;
}

.camera-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 5px;
  font-size: 12px;
  white-space: nowrap;
  margin-top: 5px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.camera-marker.large:hover .camera-tooltip {
  opacity: 1;
}

.floor-plan-info {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(248, 249, 250, 0.8);
}

.plan-stats {
  display: flex;
  gap: 15px;
}

.stat {
  font-size: 0.9rem;
  color: #636e72;
}

.plan-type {
  font-size: 0.9rem;
  color: #636e72;
}

.cameras-list {
  padding: 20px;
}

.cameras-list h4 {
  margin: 0 0 15px 0;
  color: #2d3436;
}

.camera-items {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
}

.camera-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.camera-item:hover {
  background: rgba(116, 185, 255, 0.1);
}

.camera-status {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.camera-status.online {
  background: #00b894;
}

.camera-status.offline {
  background: #ff7675;
}

.camera-status.maintenance {
  background: #fdcb6e;
}

.camera-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.camera-name {
  font-weight: 600;
  color: #2d3436;
}

.camera-type {
  font-size: 0.85rem;
  color: #636e72;
  text-transform: capitalize;
}

.btn-small {
  padding: 6px 12px;
  font-size: 0.8rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-success {
  background: #00b894;
  color: white;
}

.btn-danger {
  background: #ff7675;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 90%;
  overflow: hidden;
}

.modal-content.large {
  max-width: 90%;
  max-height: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(116, 185, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  color: #2d3436;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.full-floor-plan {
  position: relative;
  max-height: 70vh;
  overflow: auto;
}

.full-floor-plan img {
  max-width: 100%;
  height: auto;
  display: block;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  background: rgba(248, 249, 250, 0.8);
}

.warning {
  color: #ff7675;
  font-weight: 600;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: #74b9ff;
  color: white;
}

.btn-secondary {
  background: #636e72;
  color: white;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .floor-plans-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 