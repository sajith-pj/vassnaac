import React, { useEffect } from 'react'
import logo from "../../assets/header_logo1.png"

function Maintenance() {

  useEffect(() => {
    localStorage.clear()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <img src={logo} height='200px' width='200px' alt='Maintenance' />
      <h2 style={{ color: '#012970', marginTop: '10px' }}>Temporarily Down for Maintenance!</h2>
    </div>
  )
}

export default Maintenance