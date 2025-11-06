'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import ChecksheetBuilder from '@/components/ChecksheetBuilder'
import DashboardLayout from '@/components/DashboardLayout'

export default function CreateChecksheetPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/checksheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const checksheet = await response.json()
        router.push(`/checksheets/${checksheet.id}`)
      } else {
        alert('Failed to create checksheet')
      }
    } catch (error) {
      console.error('Error saving checksheet:', error)
      alert('An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || !session?.user) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Checksheet</h1>
          <p className="text-gray-600 mt-2">
            Build a custom checksheet or use AI to generate one
          </p>
        </div>
        <ChecksheetBuilder onSave={handleSave} />
      </div>
    </DashboardLayout>
  )
}
