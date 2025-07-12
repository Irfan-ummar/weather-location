import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ProjectsList from '../views/ProjectsList.vue'
import ProjectDetails from '../views/ProjectDetails.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/projects',
    name: 'ProjectsList',
    component: ProjectsList
  },
  {
    path: '/project/new',
    name: 'CreateProject',
    component: ProjectDetails
  },
  {
    path: '/project/:id',
    name: 'EditProject',
    component: ProjectDetails,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 