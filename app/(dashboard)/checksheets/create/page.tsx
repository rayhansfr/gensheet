'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Swal from 'sweetalert2'
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
        await Swal.fire({
          icon: 'success',
          title: 'Checksheet Created!',
          text: 'Your checksheet has been created successfully.',
          timer: 2000,
          showConfirmButton: false
        })
        router.push(`/checksheets/${checksheet.id}`)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to create checksheet',
        })
      }
    } catch (error) {
      console.error('Error saving checksheet:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while creating checksheet',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (status === 'loading' || !session?.user) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
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
