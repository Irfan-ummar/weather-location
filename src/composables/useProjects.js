import { ref, reactive } from 'vue'

export function useProjects() {
  const projects = ref([])
  const currentProject = ref(null)

  // Load projects from localStorage
  const loadProjects = () => {
    try {
      const stored = localStorage.getItem('weather-app-projects')
      if (stored) {
        projects.value = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      projects.value = []
    }
  }

  // Save projects to localStorage
  const saveProjects = () => {
    try {
      localStorage.setItem('weather-app-projects', JSON.stringify(projects.value))
    } catch (error) {
      console.error('Error saving projects:', error)
    }
  }

  // Add a new project
  const addProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    projects.value.push(newProject)
    saveProjects()
    return newProject
  }

  // Update existing project
  const updateProject = (projectId, projectData) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...projectData,
        updatedAt: new Date().toISOString()
      }
      saveProjects()
      return projects.value[index]
    }
    return null
  }

  // Delete project
  const deleteProject = (projectId) => {
    const index = projects.value.findIndex(p => p.id === projectId)
    if (index !== -1) {
      projects.value.splice(index, 1)
      saveProjects()
      return true
    }
    return false
  }

  // Get project by ID
  const getProject = (projectId) => {
    return projects.value.find(p => p.id === projectId)
  }

  // Set current project
  const setCurrentProject = (project) => {
    currentProject.value = project
  }

  // Clear current project
  const clearCurrentProject = () => {
    currentProject.value = null
  }

  // Initialize
  loadProjects()

  return {
    projects,
    currentProject,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    setCurrentProject,
    clearCurrentProject,
    loadProjects
  }
} 