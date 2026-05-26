/**
 * Fetch TLE data from CelesTrak
 * CelesTrak provides free TLE data for satellites
 */

const CELESTRAK_BASE = 'https://celestrak.org/NORAD/elements/gp.php'

// Categories and their CelesTrak query parameters
export const TLE_CATEGORIES = {
  iss: { name: 'ISS', query: 'CATNR=25544', category: 'iss' },
  starlink: { name: 'Starlink', query: 'GROUP=starlink', category: 'starlink' },
  gps: { name: 'GPS Operational', query: 'GROUP=gps-ops', category: 'gps' },
  weather: { name: 'Weather', query: 'GROUP=weather', category: 'weather' },
  science: { name: 'Earth Science', query: 'GROUP=science', category: 'science' },
  communication: { name: 'Communication', query: 'GROUP=communications', category: 'communication' },
  amateur: { name: 'Amateur Radio', query: 'GROUP=amateur', category: 'amateur' },
  geo: { name: 'Geostationary', query: 'GROUP=geo', category: 'geo' },
  india: { name: 'India (ISRO)', query: 'CATNR=42767,39216,44268,54361,45026', category: 'india' },
}

/**
 * Fetch TLE data for a specific category
 */
export const fetchTLECategory = async (categoryKey) => {
  const category = TLE_CATEGORIES[categoryKey]
  if (!category) throw new Error(`Unknown category: ${categoryKey}`)
  
  try {
    const response = await fetch(`${CELESTRAK_BASE}?${category.query}&FORMAT=TLE`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const text = await response.text()
    return parseTLEText(text, category.category)
  } catch (error) {
    console.error(`Error fetching TLE for ${categoryKey}:`, error)
    return []
  }
}

/**
 * Parse TLE text format
 * TLE format: 3 lines per satellite (Name, Line1, Line2)
 */
const parseTLEText = (text, category) => {
  const lines = text.trim().split('\n')
  const satellites = []
  
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      const name = lines[i].trim()
      const line1 = lines[i + 1].trim()
      const line2 = lines[i + 2].trim()
      
      if (line1.startsWith('1 ') && line2.startsWith('2 ')) {
        satellites.push({ name, line1, line2, category })
      }
    }
  }
  
  return satellites
}

/**
 * Fetch multiple categories
 */
export const fetchMultipleTLECategories = async (categoryKeys) => {
  const promises = categoryKeys.map(key => fetchTLECategory(key))
  const results = await Promise.allSettled(promises)
  
  const allSatellites = []
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allSatellites.push(...result.value)
    } else {
      console.error(`Failed to fetch ${categoryKeys[index]}:`, result.reason)
    }
  })
  
  return allSatellites
}

/**
 * Fetch all available TLE data (limited set for performance)
 */
export const fetchAllTLE = async () => {
  const categories = ['iss', 'starlink', 'gps', 'weather', 'science', 'india']
  return fetchMultipleTLECategories(categories)
}

/**
 * FALLBACK: Sample TLE data for development/offline use
 */
export const SAMPLE_TLE_DATA = [
  {
    name: 'ISS (ZARYA)',
    line1: '1 25544U 98067A   24001.50000000  .00020351  00000-0  37055-3 0  9993',
    line2: '2 25544  51.6412 326.4278 0001234  87.5678 272.5678 15.50236456430123',
    category: 'iss'
  },
  {
    name: 'STARLINK-1007',
    line1: '1 44713U 19074A   24001.50000000  .00001200  00000-0  10000-3 0  9991',
    line2: '2 44713  53.0000 100.0000 0001000  90.0000 270.0000 15.06000000100000',
    category: 'starlink'
  },
  {
    name: 'STARLINK-1008',
    line1: '1 44714U 19074B   24001.60000000  .00001150  00000-0  98000-4 0  9992',
    line2: '2 44714  53.0000 105.0000 0001000  95.0000 265.0000 15.06000000100001',
    category: 'starlink'
  },
  {
    name: 'GPS IIR-11',
    line1: '1 27663U 03005A   24001.50000000 -.00000023  00000-0  00000+0 0  9991',
    line2: '2 27663  55.1234  60.0000 0123456 250.0000 108.0000  2.00565432123456',
    category: 'gps'
  },
  {
    name: 'NOAA 18',
    line1: '1 28654U 05018A   24001.50000000  .00000100  00000-0  80000-4 0  9991',
    line2: '2 28654  98.7234  50.0000 0014000  90.0000 270.0000 14.10000000100000',
    category: 'weather'
  },
  {
    name: 'HUBBLE SPACE TELESCOPE',
    line1: '1 20580U 90037B   24001.50000000  .00000800  00000-0  40000-4 0  9991',
    line2: '2 20580  28.4700 110.0000 0002700  90.0000 270.0000 15.09000000100000',
    category: 'science'
  },
  {
    name: 'CARTOSAT 2E',
    line1: '1 42767U 17036C   26140.18434543  .00002797  00000-0  13596-3 0  9990',
    line2: '2 42767  97.4281 200.4446 0004095  57.0225 303.1403 15.19235275493895',
    category: 'india'
  },
  {
    name: 'INSAT-3D',
    line1: '1 39216U 13038B   26136.91128309 -.00000330  00000-0  00000-0 0  9994',
    line2: '2 39216   1.8459  82.9101 0001039 299.8182 309.4735  1.00272296 46766',
    category: 'india'
  },
  {
    name: 'RISAT-2B',
    line1: '1 44268U 19028A   26140.18342123  .00000843  00000-0  34521-4 0  9991',
    line2: '2 44268  37.0142 189.5432 0008432  65.1234 294.3412 14.83294821384912',
    category: 'india'
  },
  {
    name: 'EOS-06 (OCEANSAT-3)',
    line1: '1 54361U 22163A   26140.18342123  .00000124  00000-0  21345-4 0  9992',
    line2: '2 54361  97.4231 150.3214 0001234  80.3214 279.4312 14.89243123184912',
    category: 'india'
  },
  {
    name: 'GSAT-30',
    line1: '1 45026U 20004A   26140.18342123 -.00000213  00000-0  00000-0 0  9993',
    line2: '2 45026   0.0213  83.4321 0001234 120.4321 210.3214  1.00273412  21340',
    category: 'india'
  },
]

/**
 * Load TLE data with fallback
 */
export const loadTLEData = async (useLive = true) => {
  if (!useLive) return SAMPLE_TLE_DATA
  
  try {
    const data = await fetchAllTLE()
    // Limit to reasonable number for performance
    const limited = data.slice(0, 500)
    console.log(`Loaded ${limited.length} satellites from CelesTrak`)
    return limited
  } catch (error) {
    console.error('Failed to fetch live TLE, using sample data:', error)
    return SAMPLE_TLE_DATA
  }
}
