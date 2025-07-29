import { ref, reactive, computed } from 'vue'

// Global camera state
const cameras = ref([])
const floorPlans = ref([])
const selectedFloorPlan = ref(null)

export function useCameras() {
  // Camera management functions
  const addCamera = (camera) => {
    const newCamera = {
      id: Date.now().toString(),
      name: camera.name || `Camera ${cameras.value.length + 1}`,
      x: camera.x,
      y: camera.y,
      floorPlanId: camera.floorPlanId,
      type: camera.type || 'indoor', // indoor, outdoor
      status: 'offline', // online, offline, maintenance
      description: camera.description || '',
      createdAt: new Date().toISOString(),
      ...camera
    }
    cameras.value.push(newCamera)
    return newCamera
  }

  const removeCamera = (cameraId) => {
    const index = cameras.value.findIndex(cam => cam.id === cameraId)
    if (index > -1) {
      cameras.value.splice(index, 1)
    }
  }

  const updateCamera = (cameraId, updates) => {
    const camera = cameras.value.find(cam => cam.id === cameraId)
    if (camera) {
      Object.assign(camera, updates)
    }
  }

  const getCameraById = (cameraId) => {
    return cameras.value.find(cam => cam.id === cameraId)
  }

  const getCamerasByFloorPlan = (floorPlanId) => {
    return cameras.value.filter(cam => cam.floorPlanId === floorPlanId)
  }

  // Floor plan management functions
  const addFloorPlan = (floorPlan) => {
    const newFloorPlan = {
      id: Date.now().toString(),
      name: floorPlan.name,
      type: floorPlan.type, // 'upload' or 'map'
      imageUrl: floorPlan.imageUrl,
      mapData: floorPlan.mapData, // for map snapshots
      width: floorPlan.width || 800,
      height: floorPlan.height || 600,
      createdAt: new Date().toISOString(),
      ...floorPlan
    }
    floorPlans.value.push(newFloorPlan)
    return newFloorPlan
  }

  const removeFloorPlan = (floorPlanId) => {
    // Remove all cameras associated with this floor plan
    cameras.value = cameras.value.filter(cam => cam.floorPlanId !== floorPlanId)
    
    // Remove the floor plan
    const index = floorPlans.value.findIndex(fp => fp.id === floorPlanId)
    if (index > -1) {
      floorPlans.value.splice(index, 1)
    }
    
    // Clear selection if it was the selected floor plan
    if (selectedFloorPlan.value?.id === floorPlanId) {
      selectedFloorPlan.value = null
    }
  }

  const selectFloorPlan = (floorPlanId) => {
    selectedFloorPlan.value = floorPlans.value.find(fp => fp.id === floorPlanId) || null
  }

  // Computed properties
  const totalCameras = computed(() => cameras.value.length)
  const onlineCameras = computed(() => cameras.value.filter(cam => cam.status === 'online').length)
  const offlineCameras = computed(() => cameras.value.filter(cam => cam.status === 'offline').length)

  // File upload helper
  const handleFileUpload = (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      reader.readAsDataURL(file)
    })
  }

  // Map screenshot helper
  const takeMapSnapshot = async (mapInstance, bounds) => {
    return new Promise((resolve) => {
      // This would be implemented when we have the actual map integration
      // For now, we'll return a placeholder
      setTimeout(() => {
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
      }, 100)
    })
  }

  return {
    // State
    cameras,
    floorPlans,
    selectedFloorPlan,
    
    // Camera functions
    addCamera,
    removeCamera,
    updateCamera,
    getCameraById,
    getCamerasByFloorPlan,
    
    // Floor plan functions
    addFloorPlan,
    removeFloorPlan,
    selectFloorPlan,
    
    // Computed
    totalCameras,
    onlineCameras,
    offlineCameras,
    
    // Helpers
    handleFileUpload,
    takeMapSnapshot
  }
} 