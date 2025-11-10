import React, { useState } from 'react'
import { getAvailableServers, setActiveServer, getCurrentServerKey } from '../services/api'

export default function ServerSelector({ compact = false, showLabel = true }) {
  const [servers] = useState(getAvailableServers())
  const [current, setCurrent] = useState(getCurrentServerKey())

  function handleChange(e) {
    const newServer = e.target.value
    if (setActiveServer(newServer)) {
      setCurrent(newServer)
    }
  }

  if (compact) {
    return (
      <select 
        value={current} 
        onChange={handleChange}
        style={{ 
          padding: '8px 12px', 
          borderRadius: '6px', 
          border: '1px solid #e5e7eb',
          fontSize: '14px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        {servers.map(s => (
          <option key={s.key} value={s.key}>{s.name}</option>
        ))}
      </select>
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      {showLabel && (
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
          🌐 Servidor API:
        </label>
      )}
      <select 
        value={current} 
        onChange={handleChange}
        style={{ 
          width: '100%', 
          padding: '10px', 
          borderRadius: '6px', 
          border: '1px solid #e5e7eb',
          fontSize: '14px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        {servers.map(s => (
          <option key={s.key} value={s.key}>
            {s.name}
          </option>
        ))}
      </select>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
        {servers.find(s => s.key === current)?.url}
      </div>
    </div>
  )
}
