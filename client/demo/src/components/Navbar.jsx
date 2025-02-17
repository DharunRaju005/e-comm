import React from 'react'
import logo from '../assets/logo.png'
import "../styles/Navbar.css"
function Navbar() {
  return (
    <div>
        <img className = "nav-logo" src={logo} alt="logo" />
    </div>
  )
}

export default Navbar