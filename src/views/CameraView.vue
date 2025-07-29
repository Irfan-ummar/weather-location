<template>
  <div class="camera-view-page">
    <div class="container">
      <div v-if="camera" class="camera-content">
        <!-- Camera Header -->
        <div class="camera-header">
          <div class="header-info">
            <button class="btn-back" @click="goBack">← Back</button>
            <div class="camera-title">
              <h1>{{ camera.name }}</h1>
              <div class="camera-status" :class="camera.status">
                <span class="status-indicator"></span>
                {{ camera.status.charAt(0).toUpperCase() + camera.status.slice(1) }}
              </div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="btn btn-secondary" 
              @click="showSettings = !showSettings"
            >
              ⚙️ Settings
            </button>
            <button 
              class="btn" 
              :class="camera.status === 'online' ? 'btn-danger' : 'btn-success'"
              @click="toggleCameraStatus"
            >
              {{ camera.status === 'online' ? '⏹️ Turn Off' : '▶️ Turn On' }}
            </button>
          </div>
        </div>

        <!-- Camera Feed Area -->
        <div class="camera-feed-section">
          <div class="camera-feed">
            <div v-if="camera.status === 'online'" class="live-feed">
              <div class="feed-placeholder">
                <div class="feed-icon">📹</div>
                <h3>Live Camera Feed</h3>
                <p>Camera feed will be displayed here</p>
                <small>Connect to Django backend for live streaming</small>
              </div>
              <div class="feed-controls">
                <button class="control-btn">🔍 Zoom</button>
                <button class="control-btn">📷 Snapshot</button>
                <button class="control-btn">🎥 Record</button>
                <button class="control-btn">🔊 Audio</button>
              </div>
            </div>
            <div v-else class="offline-feed">
              <div class="offline-icon">📵</div>
              <h3>Camera Offline</h3>
              <p>This camera is currently offline</p>
              <button class="btn btn-primary" @click="toggleCameraStatus">
                Turn On Camera
              </button>
            </div>
          </div>

          <!-- Camera Information Panel -->
          <div class="camera-info-panel">
            <div class="info-section">
              <h3>Camera Details</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Name:</label>
                  <span>{{ camera.name }}</span>
                </div>
                <div class="info-item">
                  <label>Type:</label>
                  <span class="camera-type">{{ camera.type }}</span>
                </div>
                <div class="info-item">
                  <label>Status:</label>
                  <span class="status" :class="camera.status">{{ camera.status }}</span>
                </div>
                <div class="info-item">
                  <label>Location:</label>
                  <span>{{ floorPlan?.name || 'Unknown' }}</span>
                </div>
                <div class="info-item">
                  <label>Added:</label>
                  <span>{{ formatDate(camera.createdAt) }}</span>
                </div>
                <div v-if="camera.description" class="info-item full-width">
                  <label>Description:</label>
                  <span>{{ camera.description }}</span>
                </div>
              </div>
            </div>

            <!-- Floor Plan Location -->
            <div class="info-section">
              <h3>Floor Plan Location</h3>
              <div v-if="floorPlan" class="floor-plan-mini">
                <img :src="floorPlan.imageUrl" :alt="floorPlan.name" />
                <div class="camera-marker-mini" 
                     :style="{ 
                       left: (camera.x / floorPlan.width * 100) + '%', 
                       top: (camera.y / floorPlan.height * 100) + '%' 
                     }">
                  📹
                </div>
              </div>
              <router-link 
                v-if="floorPlan" 
                :to="`/cameras`" 
                class="btn btn-outline"
              >
                View All Cameras
              </router-link>
            </div>

            <!-- Recent Activity -->
            <div class="info-section">
              <h3>Recent Activity</h3>
              <div class="activity-list">
                <div class="activity-item">
                  <span class="activity-time">2 minutes ago</span>
                  <span class="activity-text">Motion detected</span>
                </div>
                <div class="activity-item">
                  <span class="activity-time">15 minutes ago</span>
                  <span class="activity-text">Camera came online</span>
                </div>
                <div class="activity-item">
                  <span class="activity-time">1 hour ago</span>
                  <span class="activity-text">Recording started</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Panel -->
        <div v-if="showSettings" class="settings-panel">
          <div class="settings-header">
            <h3>Camera Settings</h3>
            <button class="btn-close" @click="showSettings = false">×</button>
          </div>
          <div class="settings-content">
            <div class="setting-group">
              <label>Camera Name:</label>
              <input 
                v-model="editedCamera.name" 
                type="text" 
                class="form-input"
              />
            </div>
            <div class="setting-group">
              <label>Camera Type:</label>
              <select v-model="editedCamera.type" class="form-select">
                <option value="indoor">Indoor Camera</option>
                <option value="outdoor">Outdoor Camera</option>
              </select>
            </div>
            <div class="setting-group">
              <label>Description:</label>
              <textarea 
                v-model="editedCamera.description" 
                class="form-textarea"
                rows="3"
              ></textarea>
            </div>
            <div class="setting-group">
              <label>Recording Quality:</label>
              <select class="form-select">
                <option>1080p HD</option>
                <option>720p</option>
                <option>480p</option>
              </select>
            </div>
            <div class="setting-group">
              <label>Motion Detection:</label>
              <div class="toggle-switch">
                <input type="checkbox" id="motion-detection" checked />
                <label for="motion-detection" class="toggle-label"></label>
              </div>
            </div>
            <div class="setting-group">
              <label>Night Vision:</label>
              <div class="toggle-switch">
                <input type="checkbox" id="night-vision" checked />
                <label for="night-vision" class="toggle-label"></label>
              </div>
            </div>
          </div>
          <div class="settings-actions">
            <button class="btn btn-secondary" @click="cancelSettings">Cancel</button>
            <button class="btn btn-primary" @click="saveSettings">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- Camera Not Found -->
      <div v-else class="camera-not-found">
        <div class="error-icon">❌</div>
        <h2>Camera Not Found</h2>
        <p>The requested camera could not be found.</p>
        <router-link to="/cameras" class="btn btn-primary">
          Back to Camera Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCameras } from '../composables/useCameras.js'

export default {
  name: 'CameraView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { 
      getCameraById, 
      floorPlans, 
      updateCamera 
    } = useCameras()

    // Local state
    const showSettings = ref(false)
    const editedCamera = ref({})

    // Computed
    const camera = computed(() => {
      return getCameraById(route.params.id)
    })

    const floorPlan = computed(() => {
      if (!camera.value) return null
      return floorPlans.value.find(fp => fp.id === camera.value.floorPlanId)
    })

    // Methods
    const goBack = () => {
      router.go(-1)
    }

    const toggleCameraStatus = () => {
      if (camera.value) {
        const newStatus = camera.value.status === 'online' ? 'offline' : 'online'
        updateCamera(camera.value.id, { status: newStatus })
      }
    }

    const saveSettings = () => {
      if (camera.value) {
        updateCamera(camera.value.id, {
          name: editedCamera.value.name,
          type: editedCamera.value.type,
          description: editedCamera.value.description
        })
        showSettings.value = false
      }
    }

    const cancelSettings = () => {
      if (camera.value) {
        editedCamera.value = {
          name: camera.value.name,
          type: camera.value.type,
          description: camera.value.description
        }
      }
      showSettings.value = false
    }

    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }

    // Initialize edited camera data
    onMounted(() => {
      if (camera.value) {
        editedCamera.value = {
          name: camera.value.name,
          type: camera.value.type,
          description: camera.value.description
        }
      }
    })

    return {
      camera,
      floorPlan,
      showSettings,
      editedCamera,
      goBack,
      toggleCameraStatus,
      saveSettings,
      cancelSettings,
      formatDate
    }
  }
}
</script>

<style scoped>
.camera-view-page {
  min-height: calc(100vh - 80px);
  padding: 20px 0;
}

.camera-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  background: #636e72;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #2d3436;
}

.camera-title h1 {
  margin: 0 0 5px 0;
  color: #2d3436;
  font-size: 2rem;
}

.camera-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.camera-status.online {
  color: #00b894;
}

.camera-status.online .status-indicator {
  background: #00b894;
}

.camera-status.offline {
  color: #ff7675;
}

.camera-status.offline .status-indicator {
  background: #ff7675;
}

.camera-status.maintenance {
  color: #fdcb6e;
}

.camera-status.maintenance .status-indicator {
  background: #fdcb6e;
}

.header-actions {
  display: flex;
  gap: 15px;
}

.camera-feed-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.camera-feed {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.live-feed {
  height: 500px;
  position: relative;
}

.feed-placeholder {
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #2d3436;
  color: white;
  text-align: center;
}

.feed-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.feed-placeholder h3 {
  margin: 0 0 10px 0;
}

.feed-placeholder p {
  margin: 0 0 10px 0;
  opacity: 0.8;
}

.feed-placeholder small {
  opacity: 0.6;
}

.feed-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  background: rgba(248, 249, 250, 0.9);
}

.control-btn {
  background: #74b9ff;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #5a9dff;
}

.offline-feed {
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(248, 249, 250, 0.9);
  color: #636e72;
  text-align: center;
}

.offline-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.camera-info-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-section {
  background: rgba(255, 255, 255, 0.9);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.info-section h3 {
  margin: 0 0 20px 0;
  color: #2d3436;
  font-size: 1.3rem;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.info-item.full-width {
  grid-column: 1 / -1;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
}

.info-item label {
  font-weight: 600;
  color: #636e72;
}

.info-item span {
  color: #2d3436;
}

.camera-type {
  text-transform: capitalize;
}

.status {
  font-weight: 600;
  text-transform: capitalize;
}

.status.online {
  color: #00b894;
}

.status.offline {
  color: #ff7675;
}

.status.maintenance {
  color: #fdcb6e;
}

.floor-plan-mini {
  position: relative;
  border: 2px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 15px;
  height: 150px;
}

.floor-plan-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-marker-mini {
  position: absolute;
  transform: translate(-50%, -50%);
  background: rgba(116, 185, 255, 0.9);
  border: 2px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 8px;
}

.activity-time {
  font-size: 0.8rem;
  color: #636e72;
}

.activity-text {
  color: #2d3436;
}

.settings-panel {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
}

.settings-panel::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(116, 185, 255, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.settings-header h3 {
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

.settings-content {
  padding: 20px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3436;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #74b9ff;
}

.toggle-switch {
  position: relative;
  display: inline-block;
}

.toggle-switch input {
  display: none;
}

.toggle-label {
  display: block;
  width: 50px;
  height: 24px;
  background: #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.toggle-label::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-switch input:checked + .toggle-label {
  background: #74b9ff;
}

.toggle-switch input:checked + .toggle-label::after {
  transform: translateX(26px);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px;
  background: rgba(248, 249, 250, 0.8);
}

.camera-not-found {
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  padding: 80px 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 5rem;
  margin-bottom: 30px;
}

.camera-not-found h2 {
  color: #2d3436;
  margin-bottom: 15px;
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

.btn-success {
  background: #00b894;
  color: white;
}

.btn-danger {
  background: #ff7675;
  color: white;
}

.btn-outline {
  background: transparent;
  border: 2px solid #74b9ff;
  color: #74b9ff;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .camera-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .header-info {
    flex-direction: column;
    gap: 10px;
  }
  
  .camera-feed-section {
    grid-template-columns: 1fr;
  }
  
  .feed-controls {
    flex-wrap: wrap;
  }
  
  .settings-panel {
    width: 95%;
  }
}
</style> 