'use client'

import { useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  Home, 
  PlusCircle, 
  ClipboardList, 
  Layers, 
  Bot, 
  PlayCircle, 
  BarChart3, 
  Users, 
  Settings, 
  Bell, 
  Search, 
  Menu, 
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Globe,
  Award
} from 'lucide-react'

interface DashboardLayoutProps {
  children: ReactNode
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Create Checksheet', href: '/checksheets/create', icon: PlusCircle },
  { name: 'My Checksheets', href: '/checksheets', icon: ClipboardList },
  { name: 'Templates', href: '/templates', icon: Layers },
  { name: 'AI Assistant', href: '/ai', icon: Bot },
  { name: 'Execute', href: '/execute', icon: PlayCircle },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Best Practices', href: '/best-practices', icon: Award },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const languages = [
  { code: 'en', name: 'EN', fullName: 'English' },
  { code: 'id', name: 'ID', fullName: 'Indonesian' },
  { code: 'es', name: 'ES', fullName: 'Spanish' },
  { code: 'fr', name: 'FR', fullName: 'French' },
  { code: 'de', name: 'DE', fullName: 'German' },
  { code: 'zh', name: 'ZH', fullName: 'Chinese' },
  { code: 'ja', name: 'JA', fullName: 'Japanese' },
]

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState('en')
  const pathname = usePathname()

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode')
    const isDark = savedMode === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' })
  }

  return (
    <div className="min-h-screen">
      <div className="bg-gray-100 transition-colors duration-300">
        {/* Top Navigation */}
        <nav className="bg-white shadow-lg border-b border-gray-200 fixed w-full top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <div className="flex items-center ml-4 lg:ml-0">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-600 to-green-600 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h1 className="text-xl font-bold text-gray-900">GenSheet Master</h1>
                    <p className="text-xs text-gray-500">Global Industry Solutions</p>
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Search checksheets..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 focus:outline-none"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedLang.toUpperCase()}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {langMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setSelectedLang(lang.code)
                            setLangMenuOpen(false)
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {lang.fullName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-600 to-green-600 flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <span className="hidden md:block text-gray-700 font-medium text-sm">
                      {user?.name || user?.email || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <p className="text-xs text-teal-600 mt-1 font-medium">{user?.role || 'USER'}</p>
                      </div>
                      <Link href="/settings">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Profile
                        </button>
                      </Link>
                      <Link href="/settings">
                        <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          Settings
                        </button>
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out mt-16 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 px-4 py-6 overflow-y-auto">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-teal-50 text-teal-600'
                          : 'text-gray-700 hover:bg-teal-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <div className="px-4 py-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <p>Version 1.0.0</p>
                <p>© 2025 GenSheet Master</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="lg:ml-64 pt-16">
          {children}
        </div>
      </div>
    </div>
  )
}
