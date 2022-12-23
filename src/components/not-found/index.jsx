import React from 'react'
import { Link } from 'react-router-dom'
import logo1 from "../../assets/header_logo1.png"

function NotFound() {
  let style = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh', flexDirection: 'column' }
  return (
    <div style={style}>
      <img src={logo1} height='55px' width='50px' alt="logo" className='mb-4' />
      <h3>Invalid Route</h3>
      <Link to='/'>Go Back</Link>
    </div>
  )
}

export default NotFound