import { useState, useEffect, useCallback, memo } from 'react'
import './App.css'

// Pastel color palette
const PASTEL_COLORS = [
  '#FFE5F1', // Soft pink
  '#E8F5E9', // Mint green
  '#FFF9E6', // Cream
  '#E3F2FD', // Sky blue
  '#F3E5F5', // Lavender
  '#FFECB3', // Peach
  '#E0F7FA', // Light cyan
  '#FCE4EC', // Rose
  '#E8EAF6', // Periwinkle
  '#FFF3E0', // Apricot
]

// Grid configuration: 11 columns x 9 rows = 99 lamps
const GRID_COLS = 11
const GRID_ROWS = 9
const LAMP_SIZE = 28 // Uniform size for all lamps (smaller to prevent overlap)

// Memoized Lamp component for performance
const Lamp = memo(({ lamp, onClick }) => {
  return (
    <div
      className="lamp"
      style={{
        left: `${lamp.x}%`,
        top: `${lamp.y}%`,
        width: `${lamp.size}px`,
        height: `${lamp.size}px`,
        '--lamp-color': lamp.color,
        '--lamp-brightness': lamp.brightness,
        '--lamp-glow': lamp.glow,
        '--lamp-active': lamp.active ? 1 : 0,
      }}
      onClick={onClick}
    />
  )
})

Lamp.displayName = 'Lamp'

// Memoized LightSpot component
const LightSpot = memo(({ lamp }) => {
  const intensity = lamp.brightness * lamp.glow
  const opacity = Math.max(0, Math.min(1, intensity * 0.4))
  const size = 120 + (intensity * 100)
  
  return (
    <div
      className="light-spot"
      style={{
        left: `${lamp.x}%`,
        top: `${lamp.y}%`,
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: lamp.color,
        opacity: opacity,
        transform: 'translate(-50%, -50%)',
      }}
    />
  )
})

LightSpot.displayName = 'LightSpot'

function App() {
  const [lamps, setLamps] = useState(() => {
    // Load from localStorage or initialize
    const saved = localStorage.getItem('lamps-state')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // If parse fails, initialize fresh
      }
    }
    // Initialize 99 lamps in an 11x9 grid with uniform size
    const lamps = []
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        lamps.push({
          id: row * GRID_COLS + col,
          gridCol: col,
          gridRow: row,
          // Calculate positions with proper spacing to prevent overlap
          x: 10 + (col / (GRID_COLS - 1)) * 80, // 10% to 90% margin
          y: 10 + (row / (GRID_ROWS - 1)) * 80, // 10% to 90% margin
          color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
          size: LAMP_SIZE,
          brightness: 0.5 + Math.random() * 0.5,
          glow: 0.3 + Math.random() * 0.4,
          active: false,
        })
      }
    }
    return lamps
  })

  const [showColorPalette, setShowColorPalette] = useState(false)
  const [selectedLampId, setSelectedLampId] = useState(null)

  // Debounced localStorage save
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('lamps-state', JSON.stringify(lamps))
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [lamps])

  const handleLampClick = useCallback((id) => {
    setLamps((prevLamps) =>
      prevLamps.map((lamp) =>
        lamp.id === id
          ? {
              ...lamp,
              active: !lamp.active,
              brightness: lamp.active ? 0.5 : 1,
              glow: lamp.active ? 0.3 : 0.8,
              color: lamp.active
                ? lamp.color
                : PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
            }
          : lamp
      )
    )
    setSelectedLampId(id)
    setShowColorPalette(true)
  }, [])

  const handleColorSelect = useCallback((color) => {
    if (selectedLampId !== null) {
      setLamps((prevLamps) =>
        prevLamps.map((lamp) =>
          lamp.id === selectedLampId
            ? { ...lamp, color, active: true, brightness: 1, glow: 0.8 }
            : lamp
        )
      )
    }
  }, [selectedLampId])

  const handleGlobalChange = useCallback((type) => {
    setLamps((prevLamps) =>
      prevLamps.map((lamp) => {
        switch (type) {
          case 'brighten':
            return {
              ...lamp,
              brightness: Math.min(1, lamp.brightness + 0.1),
              glow: Math.min(1, lamp.glow + 0.1),
            }
          case 'dim':
            return {
              ...lamp,
              brightness: Math.max(0.2, lamp.brightness - 0.1),
              glow: Math.max(0.1, lamp.glow - 0.1),
            }
          case 'randomize':
            return {
              ...lamp,
              color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
              brightness: 0.5 + Math.random() * 0.5,
              glow: 0.3 + Math.random() * 0.4,
            }
          case 'reset':
            return {
              ...lamp,
              active: false,
              brightness: 0.5 + Math.random() * 0.5,
              glow: 0.3 + Math.random() * 0.4,
            }
          default:
            return lamp
        }
      })
    )
  }, [])

  return (
    <div className="app">
      <div className="glass-panel controls">
        <button
          className="glass-button"
          onClick={() => handleGlobalChange('brighten')}
          aria-label="Brighten all lamps"
        />
        <button
          className="glass-button"
          onClick={() => handleGlobalChange('dim')}
          aria-label="Dim all lamps"
        />
        <button
          className="glass-button"
          onClick={() => handleGlobalChange('randomize')}
          aria-label="Randomize all lamps"
        />
        <button
          className="glass-button"
          onClick={() => handleGlobalChange('reset')}
          aria-label="Reset all lamps"
        />
      </div>

      {/* Color Palette Panel */}
      <div className={`color-palette-panel ${showColorPalette ? 'visible' : ''}`}>
        <button
          className="palette-toggle"
          onClick={() => setShowColorPalette(!showColorPalette)}
          aria-label="Toggle color palette"
        />
        <div className="color-palette">
          {PASTEL_COLORS.map((color, index) => (
            <button
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              aria-label={`Select color ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Floor layer with individual light spots that blend */}
      <div className="floor-layer">
        {lamps.map((lamp) => (
          <LightSpot key={`light-${lamp.id}`} lamp={lamp} />
        ))}
      </div>

      <div className="lamps-container">
        {lamps.map((lamp) => (
          <Lamp
            key={lamp.id}
            lamp={lamp}
            onClick={() => handleLampClick(lamp.id)}
          />
        ))}
      </div>

      <div className="glass-panel info">
        <div className="info-content" />
      </div>
    </div>
  )
}

export default App
