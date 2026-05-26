import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Satellite, ChevronLeft, ChevronRight } from 'lucide-react'
import useStore from '../store/useStore'

const CATEGORY_COLORS = {
  iss: 'bg-lime-neon/20 border-lime-neon/40 text-lime-neon',
  starlink: 'bg-cyan-bright/20 border-cyan-bright/40 text-cyan-bright',
  gps: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500',
  weather: 'bg-red-500/20 border-red-500/40 text-red-500',
  science: 'bg-purple-500/20 border-purple-500/40 text-purple-500',
  communication: 'bg-blue-500/20 border-blue-500/40 text-blue-500',
  india: 'bg-amber-500/20 border-amber-500/40 text-amber-500',
  all: 'bg-white/10 border-white/30 text-white',
}

const Sidebar = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    getFilteredSatellites,
    selectSatellite,
    selectedSatellite,
    sidebarCollapsed,
    toggleSidebar,
  } = useStore()
  
  const filteredSatellites = getFilteredSatellites()
  
  return (
    <>
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarCollapsed ? -300 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute left-0 top-0 h-full w-72 glass-panel flex flex-col m-4 z-10"
      >
        {/* Header */}
        <div className="p-4 border-b border-cyan-bright/20 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-lime-neon animate-glow-pulse" />
          <h2 className="text-xs font-bold tracking-widest text-cyan-neon uppercase">
            Satellite Tracker
          </h2>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-cyan-bright/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-bright/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search satellites..."
              className="w-full pl-10 pr-3 py-2 input-field text-sm"
            />
          </div>
        </div>
        
        {/* Category filters */}
        <div className="p-3 border-b border-cyan-bright/10 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded border transition-all ${
                selectedCategory === cat
                  ? 'bg-cyan-bright/20 border-cyan-bright/50 text-cyan-neon'
                  : 'bg-transparent border-cyan-bright/20 text-cyan-bright/60 hover:border-cyan-bright/40'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Satellite list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          {filteredSatellites.length === 0 ? (
            <div className="text-center text-cyan-bright/30 text-sm py-8">
              No satellites found
            </div>
          ) : (
            <AnimatePresence>
              {filteredSatellites.map((sat, index) => (
                <SatelliteItem
                  key={sat.noradId || index}
                  satellite={sat}
                  isSelected={selectedSatellite?.noradId === sat.noradId}
                  onClick={() => selectSatellite(sat)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Stats footer */}
        <div className="p-3 border-t border-cyan-bright/20 text-xs">
          <div className="flex justify-between text-cyan-bright/60">
            <span>Tracked:</span>
            <span className="text-cyan-neon font-semibold">{filteredSatellites.length}</span>
          </div>
        </div>
      </motion.div>
      
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-16 glass-panel-dark flex items-center justify-center hover:bg-cyan-bright/10 transition-colors"
        style={{ left: sidebarCollapsed ? '4px' : '288px' }}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-cyan-bright" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-cyan-bright" />
        )}
      </button>
    </>
  )
}

const SatelliteItem = ({ satellite, isSelected, onClick }) => {
  const colorClass = CATEGORY_COLORS[satellite.category] || CATEGORY_COLORS.all
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`p-3 mb-1 rounded-md cursor-pointer transition-all ${
        isSelected
          ? 'bg-cyan-bright/15 border-l-2 border-cyan-neon'
          : 'hover:bg-cyan-bright/5'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${colorClass.split(' ')[0]} animate-glow-pulse`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-cyan-bright/90 truncate">
            {satellite.name}
          </div>
          <div className="text-[10px] text-cyan-bright/40 mt-0.5">
            NORAD: {satellite.noradId}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Sidebar
