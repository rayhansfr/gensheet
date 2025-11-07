'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, FileText, Layers, BarChart3, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface SearchResult {
  checksheets: Array<{
    id: string
    title: string
    description: string | null
    category: string | null
    status: string
  }>
  templates: Array<{
    id: string
    title: string
    description: string | null
    category: string
  }>
  results: Array<{
    id: string
    status: string
    checksheet: {
      title: string
    }
    inspector: {
      name: string | null
      email: string
    }
  }>
}

export default function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data)
          setIsOpen(true)
        }
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClear = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
  }

  const totalResults = results 
    ? results.checksheets.length + results.templates.length + results.results.length
    : 0

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search checksheets, templates, results..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-10 bg-white border-gray-300"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && results && (
        <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {totalResults === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-2">
              {/* Checksheets */}
              {results.checksheets.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Checksheets ({results.checksheets.length})
                  </div>
                  {results.checksheets.map((item) => (
                    <Link
                      key={item.id}
                      href={`/checksheets/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600 truncate">{item.description}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          item.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                        {item.category && (
                          <span className="text-xs text-gray-500">{item.category}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Templates */}
              {results.templates.length > 0 && (
                <div className="mb-4">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Templates ({results.templates.length})
                  </div>
                  {results.templates.map((item) => (
                    <Link
                      key={item.id}
                      href={`/templates/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="font-medium text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-600 truncate">{item.description}</div>
                      {item.category && (
                        <span className="text-xs text-gray-500">{item.category}</span>
                      )}
                    </Link>
                  ))}
                </div>
              )}

              {/* Results */}
              {results.results.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Execution Results ({results.results.length})
                  </div>
                  {results.results.map((item) => (
                    <Link
                      key={item.id}
                      href={`/results/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2 hover:bg-gray-100 rounded-md"
                    >
                      <div className="font-medium text-gray-900">{item.checksheet.title}</div>
                      <div className="text-sm text-gray-600">
                        By {item.inspector.name || item.inspector.email}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        item.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
