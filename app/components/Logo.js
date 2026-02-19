// app/components/Logo.js
'use client'
import Link from 'next/link'

export default function Logo({ showText = true }) {
  return (
    <Link href="/dashboard" className="logo-link">
      <div className="logo-container">
        <div className="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path d="M8 20L12 16L16 20L20 14L24 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 24H24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="12" r="2" fill="white"/>
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#667eea"/>
                <stop offset="1" stopColor="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {showText && (
          <span className="logo-text">
            Stock<span className="logo-highlight">Sense</span> AI
          </span>
        )}
      </div>
    </Link>
  )
}