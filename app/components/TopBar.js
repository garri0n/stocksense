// app/components/TopBar.js
'use client'
export default function TopBar({ title }) {
  return (
    <div className="top-bar">
      <h2 className="page-title">{title}</h2>
      <div className="user-menu">
        <span>👋 Welcome, Bro!</span>
        <div className="user-avatar">B</div>
      </div>
    </div>
  )
}