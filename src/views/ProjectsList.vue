<template>
  <div class="projects-list-page">
    <div class="container">
      <div class="page-header">
        <h1>🗺️ Project Management</h1>
        <p>Manage your weather monitoring projects with location-based data.</p>
        
        <div class="header-actions">
          <router-link to="/project/new" class="btn btn-primary">
            <span>➕</span>
            Create New Project
          </router-link>
        </div>
      </div>

      <div class="projects-container">
        <!-- Empty State -->
        <div v-if="projects.length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No Projects Yet</h3>
          <p>Create your first project to start monitoring weather conditions for specific locations.</p>
          <router-link to="/project/new" class="btn btn-primary">
            Create Your First Project
          </router-link>
        </div>

        <!-- Projects Table -->
        <div v-else class="projects-table-container">
          <table class="projects-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Location</th>
                <th>Coordinates</th>
                <th>Start Date</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="project in projects" :key="project.id" class="project-row">
                <td class="project-name">
                  <div class="name-cell">
                    <span class="name">{{ project.name }}</span>
                    <span v-if="project.locality" class="locality">{{ project.locality }}</span>
                  </div>
                </td>
                <td class="location">
                  <div class="location-info">
                    <span class="city">{{ project.city || 'N/A' }}</span>
                    <span v-if="project.country" class="country">{{ project.country }}</span>
                  </div>
                </td>
                <td class="coordinates">
                  <div class="coord-display">
                    <span class="lat">{{ formatCoordinate(project.latitude) }}</span>
                    <span class="lng">{{ formatCoordinate(project.longitude) }}</span>
                  </div>
                </td>
                <td class="start-date">
                  {{ formatDate(project.startDate) }}
                </td>
                <td class="created-date">
                  {{ formatDate(project.createdAt) }}
                </td>
                <td class="actions">
                  <div class="action-buttons">
                    <button 
                      class="btn-icon btn-weather"
                      @click="showWeatherForProject(project)"
                      :title="`Check weather for ${project.name}`"
                    >
                      🌤️
                    </button>
                    <router-link 
                      :to="`/project/${project.id}`"
                      class="btn-icon btn-edit"
                      title="Edit project"
                    >
                      ✏️
                    </router-link>
                    <button 
                      class="btn-icon btn-delete"
                      @click="confirmDeleteProject(project)"
                      title="Delete project"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="delete-modal" @click.stop>
        <h3>🗑️ Delete Project</h3>
        <p>Are you sure you want to delete <strong>{{ projectToDelete?.name }}</strong>?</p>
        <p class="warning">This action cannot be undone.</p>
        
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeDeleteModal">
            Cancel
          </button>
          <button class="btn btn-danger" @click="deleteProjectConfirmed">
            Delete Project
          </button>
        </div>
      </div>
    </div>

    <!-- Weather Modal -->
    <WeatherModal 
      v-if="showWeatherModal" 
      @close="closeWeatherModal"
      :preset-coordinates="selectedProjectCoordinates"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useProjects } from '../composables/useProjects.js'
import WeatherModal from '../components/WeatherModal.vue'

export default {
  name: 'ProjectsList',
  components: {
    WeatherModal
  },
  setup() {
    const { projects, deleteProject } = useProjects()
    const showDeleteModal = ref(false)
    const projectToDelete = ref(null)
    const showWeatherModal = ref(false)
    const selectedProject = ref(null)

    const selectedProjectCoordinates = computed(() => {
      if (selectedProject.value) {
        return {
          latitude: parseFloat(selectedProject.value.latitude),
          longitude: parseFloat(selectedProject.value.longitude)
        }
      }
      return null
    })

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      } catch {
        return 'Invalid Date'
      }
    }

    const formatCoordinate = (coord) => {
      if (!coord) return 'N/A'
      return parseFloat(coord).toFixed(6)
    }

    const confirmDeleteProject = (project) => {
      projectToDelete.value = project
      showDeleteModal.value = true
    }

    const closeDeleteModal = () => {
      showDeleteModal.value = false
      projectToDelete.value = null
    }

    const deleteProjectConfirmed = () => {
      if (projectToDelete.value) {
        deleteProject(projectToDelete.value.id)
        closeDeleteModal()
      }
    }

    const showWeatherForProject = (project) => {
      if (project.latitude && project.longitude) {
        selectedProject.value = project
        showWeatherModal.value = true
      }
    }

    const closeWeatherModal = () => {
      showWeatherModal.value = false
      selectedProject.value = null
    }

    return {
      projects,
      showDeleteModal,
      projectToDelete,
      showWeatherModal,
      selectedProjectCoordinates,
      formatDate,
      formatCoordinate,
      confirmDeleteProject,
      closeDeleteModal,
      deleteProjectConfirmed,
      showWeatherForProject,
      closeWeatherModal
    }
  }
}
</script>

<style scoped>
.projects-list-page {
  min-height: calc(100vh - 80px);
  padding: 20px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2d3436;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 1.1rem;
  color: #636e72;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  justify-content: center;
}

.projects-container {
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
}

.empty-state {
  text-align: center;
  padding: 80px 40px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 1.8rem;
  color: #2d3436;
  margin-bottom: 15px;
}

.empty-state p {
  color: #636e72;
  margin-bottom: 30px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.projects-table-container {
  overflow-x: auto;
}

.projects-table {
  width: 100%;
  border-collapse: collapse;
}

.projects-table th {
  background: #f8f9fa;
  color: #2d3436;
  font-weight: 600;
  padding: 20px 15px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.projects-table td {
  padding: 20px 15px;
  border-bottom: 1px solid #e9ecef;
  vertical-align: middle;
}

.project-row:hover {
  background: rgba(116, 185, 255, 0.05);
}

.name-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.name {
  font-weight: 600;
  color: #2d3436;
}

.locality {
  font-size: 0.85rem;
  color: #636e72;
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.city {
  font-weight: 500;
  color: #2d3436;
}

.country {
  font-size: 0.85rem;
  color: #636e72;
}

.coord-display {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.lat, .lng {
  color: #636e72;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 1rem;
}

.btn-weather {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
}

.btn-weather:hover {
  background: #3498db;
  color: white;
}

.btn-edit {
  background: rgba(46, 204, 113, 0.1);
  color: #2ecc71;
}

.btn-edit:hover {
  background: #2ecc71;
  color: white;
}

.btn-delete {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.btn-delete:hover {
  background: #e74c3c;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  padding: 30px;
  border-radius: 15px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}

.delete-modal h3 {
  color: #2d3436;
  margin-bottom: 15px;
}

.delete-modal p {
  color: #636e72;
  margin-bottom: 10px;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
  font-size: 0.9rem;
}

.modal-actions {
  display: flex;
  gap: 15px;
  margin-top: 25px;
}

.modal-actions .btn {
  flex: 1;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .projects-container {
    margin: 10px;
    border-radius: 10px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .projects-table th,
  .projects-table td {
    padding: 15px 10px;
    font-size: 0.85rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 5px;
  }
  
  .btn-icon {
    width: 30px;
    height: 30px;
  }
}
</style> 