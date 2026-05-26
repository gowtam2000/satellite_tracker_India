import * as satellite from 'satellite.js'

/**
 * Parse TLE data and create satellite record
 */
export const parseTLE = (name, tleLine1, tleLine2, category = 'all') => {
  try {
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
    return {
      name,
      satrec,
      tleLine1,
      tleLine2,
      category,
      noradId: tleLine1.slice(2, 7).trim(),
    }
  } catch (error) {
    console.error('Error parsing TLE:', name, error)
    return null
  }
}

/**
 * Propagate satellite to a given time and return ECI position
 */
export const propagateSatellite = (satrec, date = new Date()) => {
  const positionAndVelocity = satellite.propagate(satrec, date)
  
  if (positionAndVelocity.position && !positionAndVelocity.error) {
    return positionAndVelocity
  }
  return null
}

/**
 * Convert ECI to geographic coordinates (lat, lon, alt)
 */
export const eciToGeodetic = (eciPosition, date) => {
  const gmst = satellite.gstime(date)
  const geodeticCoords = satellite.eciToGeodetic(eciPosition, gmst)
  
  return {
    latitude: satellite.degreesLat(geodeticCoords.latitude),
    longitude: satellite.degreesLong(geodeticCoords.longitude),
    altitude: geodeticCoords.height, // km
  }
}

/**
 * Get satellite position in ECI and geodetic coordinates
 */
export const getSatellitePosition = (satData, date = new Date()) => {
  const posVel = propagateSatellite(satData.satrec, date)
  if (!posVel || !posVel.position) return null
  
  const geodetic = eciToGeodetic(posVel.position, date)
  
  // Calculate velocity magnitude
  const velocity = posVel.velocity
  const velocityMagnitude = Math.sqrt(
    velocity.x * velocity.x + 
    velocity.y * velocity.y + 
    velocity.z * velocity.z
  )
  
  return {
    eci: posVel.position,
    velocity: posVel.velocity,
    velocityMagnitude, // km/s
    ...geodetic,
  }
}

/**
 * Get full orbit path (360 degrees) for visualization
 */
export const getOrbitPath = (satrec, date = new Date(), numPoints = 180) => {
  const points = []
  const period = (2 * Math.PI) / (satrec.no) // Orbital period in minutes
  const minutesPerPoint = period / numPoints
  
  for (let i = 0; i < numPoints; i++) {
    const futureDate = new Date(date.getTime() + i * minutesPerPoint * 60000)
    const posVel = satellite.propagate(satrec, futureDate)
    
    if (posVel.position && !posVel.error) {
      points.push({
        x: posVel.position.x,
        y: posVel.position.y,
        z: posVel.position.z,
      })
    }
  }
  
  return points
}

/**
 * Get ground track (sub-satellite points)
 */
export const getGroundTrack = (satrec, date = new Date(), numPoints = 100, durationMinutes = 90) => {
  const points = []
  const minutesPerPoint = durationMinutes / numPoints
  
  for (let i = 0; i < numPoints; i++) {
    const futureDate = new Date(date.getTime() + i * minutesPerPoint * 60000)
    const posVel = satellite.propagate(satrec, futureDate)
    
    if (posVel.position && !posVel.error) {
      const geodetic = eciToGeodetic(posVel.position, futureDate)
      points.push({
        latitude: geodetic.latitude,
        longitude: geodetic.longitude,
        altitude: geodetic.altitude,
      })
    }
  }
  
  return points
}

/**
 * Calculate orbital parameters
 */
export const getOrbitalParameters = (satrec) => {
  const n = satrec.no // Mean motion (revs per day)
  const period = (2 * Math.PI) / n // minutes
  const periodHours = period / 60
  
  // Semi-major axis (km)
  const mu = 398600.4418 // Earth's gravitational parameter
  const a = Math.pow((mu * Math.pow(period * 60, 2)) / (4 * Math.PI * Math.PI), 1/3)
  
  // Perigee and apogee (km above Earth's surface)
  const earthRadius = 6371
  const perigee = a * (1 - satrec.ecco) - earthRadius
  const apogee = a * (1 + satrec.ecco) - earthRadius
  
  return {
    period: periodHours,
    periodMinutes: period,
    inclination: satrec.inclo * (180 / Math.PI), // degrees
    eccentricity: satrec.ecco,
    semiMajorAxis: a,
    perigee,
    apogee,
    meanMotion: n,
    raan: satrec.nodeo * (180 / Math.PI), // degrees
    argOfPerigee: satrec.argpo * (180 / Math.PI), // degrees
  }
}

/**
 * Determine orbit type based on altitude
 */
export const getOrbitType = (altitude) => {
  if (altitude < 2000) return 'LEO'
  if (altitude >= 2000 && altitude < 35786) return 'MEO'
  if (altitude >= 35786 && altitude < 37000) return 'GEO'
  return 'HEO'
}

/**
 * Calculate distance between two satellites
 */
export const calculateDistance = (pos1, pos2) => {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  const dz = pos1.z - pos2.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Check for potential collision (within threshold km)
 */
export const checkCollision = (sat1Data, sat2Data, date, thresholdKm = 5) => {
  const pos1 = getSatellitePosition(sat1Data, date)
  const pos2 = getSatellitePosition(sat2Data, date)
  
  if (!pos1 || !pos2) return false
  
  const distance = calculateDistance(pos1.eci, pos2.eci)
  return distance < thresholdKm
}

/**
 * ECI to Three.js coordinate conversion
 * Three.js uses: X-right, Y-up, Z-toward viewer
 * ECI uses: X-vernal equinox, Y-90° east, Z-north pole
 */
export const eciToThreeJs = (eciPos, scale = 1/6371) => {
  return {
    x: eciPos.x * scale,
    y: eciPos.z * scale, // Z -> Y (up)
    z: eciPos.y * scale, // Y -> Z (depth)
  }
}
