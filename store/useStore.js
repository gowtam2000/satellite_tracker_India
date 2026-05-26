import { create } from 'zustand'

const useStore = create((set, get) => ({
  // Satellites
  satellites: [],
  selectedSatellite: null,
  hoveredSatellite: null,
  
  // Filters & Search
  searchQuery: '',
  selectedCategory: 'all',
  categories: ['all', 'iss', 'starlink', 'gps', 'weather', 'science', 'communication', 'india'],
  
  // Time Simulation
  simulationSpeed: 1,
  isPlaying: true,
  currentTime: Date.now(),
  
  // Visualization Settings
  showOrbits: true,
  showGrid: true,
  showAtmosphere: true,
  showStars: true,
  showLabels: true,
  showGroundTracks: false,
  showVelocityVectors: false,
  
  // Camera
  autoRotate: true,
  followSelected: false,
  
  // UI State
  sidebarCollapsed: false,
  infoPanelCollapsed: false,
  showSettings: false,
  notifications: [],
  
  // TLE Data
  tleData: {},
  lastTleUpdate: null,
  isLoadingTle: false,
  
  // Actions
  setSatellites: (satellites) => set({ satellites }),
  selectSatellite: (satellite) => set({ selectedSatellite: satellite, followSelected: satellite !== null }),
  setHoveredSatellite: (satellite) => set({ hoveredSatellite: satellite }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set((state) => ({ currentTime: typeof time === 'function' ? time(state.currentTime) : time })),
  
  toggleOrbits: () => set((state) => ({ showOrbits: !state.showOrbits })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleAtmosphere: () => set((state) => ({ showAtmosphere: !state.showAtmosphere })),
  toggleStars: () => set((state) => ({ showStars: !state.showStars })),
  toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
  toggleGroundTracks: () => set((state) => ({ showGroundTracks: !state.showGroundTracks })),
  toggleVelocityVectors: () => set((state) => ({ showVelocityVectors: !state.showVelocityVectors })),
  
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  setFollowSelected: (follow) => set({ followSelected: follow }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleInfoPanel: () => set((state) => ({ infoPanelCollapsed: !state.infoPanelCollapsed })),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now() }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  setTleData: (data) => set({ tleData: data, lastTleUpdate: Date.now() }),
  setIsLoadingTle: (loading) => set({ isLoadingTle: loading }),
  
  // Filtered satellites based on search and category
  getFilteredSatellites: () => {
    const { satellites, searchQuery, selectedCategory } = get()
    return satellites.filter(sat => {
      const matchesCategory = selectedCategory === 'all' || sat.category === selectedCategory
      const matchesSearch = sat.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  },
}))

export default useStore
