const API_URL = 'http://localhost:5000/api'

export const getProjects = async () => {
  try {
    const response = await fetch(`${API_URL}/projects`)
    if (!response.ok) {
      throw new Error('Failed to fetch projects')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching projects:', error)
    throw error
  }
}

export const getKpiData = async () => {
  try {
    const response = await fetch(`${API_URL}/kpi`)
    if (!response.ok) {
      throw new Error('Failed to fetch KPI data')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching KPI data:', error)
    throw error
  }
}