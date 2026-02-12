// app/components/Sidebar.js
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Inventory', icon: '📦', path: '/inventory' },
    { name: 'Analytics', icon: '📈', path: '/analytics' },
    { name: 'Insights', icon: '💡', path: '/insights' },
    { name: 'Reports', icon: '📄', path: '/reports' },
    { name: 'Settings', icon: '⚙️', path: '/settings' },
  ]

  return (
    <div className="sidebar">
      <div className="logo">
        StockSense AI
      </div>
      <ul className="nav-menu">
        {menuItems.map(item => (
          <li key={item.path} className="nav-item">
            <Link 
              href={item.path}
              className={`nav-link ${pathname === item.path ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}