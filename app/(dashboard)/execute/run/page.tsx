'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PhotoUpload from '@/components/PhotoUpload'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  Camera, 
  MapPin, 
  Calendar,
  Loader2,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

interface Checkpoint {
  id: string
  order: number
  title: string
  fieldType: string
  isRequired: boolean
  config?: any
}

interface Checksheet {
  id: string
  title: string
  description: string | null
  category: string | null
  checkpoints: Checkpoint[]
}

interface Response {
  checkpointId: string
  value: string
  note?: string
  photoUrl?: string
}

export default function RunChecksheetPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const checksheetId = searchParams.get('checksheet')
  
  const [checksheet, setChecksheet] = useState<Checksheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, Response>>({})
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (checksheetId) {
      fetchChecksheet()
    } else {
      router.push('/execute')
    }
  }, [checksheetId])

  const fetchChecksheet = async () => {
    try {
      const res = await fetch(`/api/checksheets/${checksheetId}`)
      if (res.ok) {
        const data = await res.json()
        setChecksheet(data)
        
        // Initialize responses
        const initialResponses: Record<string, Response> = {}
        data.checkpoints.forEach((cp: Checkpoint) => {
          initialResponses[cp.id] = {
            checkpointId: cp.id,
            value: '',
            note: '',
            photoUrl: ''
          }
        })
        setResponses(initialResponses)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Failed to fetch' }))
        console.error('Failed to fetch checksheet:', res.status, errorData)
        alert(`Error: ${errorData.error || 'Checksheet not found or you do not have access'}`)
        router.push('/execute')
      }
    } catch (error) {
      console.error('Error fetching checksheet:', error)
      alert('Error loading checksheet. Please try again.')
      router.push('/execute')
    } finally {
      setLoading(false)
    }
  }

  const handleResponseChange = (checkpointId: string, field: keyof Response, value: string) => {
    setResponses(prev => ({
      ...prev,
      [checkpointId]: {
        ...prev[checkpointId],
        [field]: value
      }
    }))
  }

  const canProceed = () => {
    if (!checksheet) return false
    const currentCheckpoint = checksheet.checkpoints[currentStep]
    if (!currentCheckpoint) return false
    
    if (currentCheckpoint.isRequired) {
      return responses[currentCheckpoint.id]?.value !== ''
    }
    return true
  }

  const handleNext = () => {
    if (checksheet && currentStep < checksheet.checkpoints.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!checksheet) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checksheetId: checksheet.id,
          location,
          notes,
          status: 'COMPLETED',
          responses: Object.values(responses).filter(r => r.value !== '')
        })
      })

      if (res.ok) {
        const result = await res.json()
        router.push(`/results/${result.id}`)
      } else {
        alert('Failed to submit checksheet')
      }
    } catch (error) {
      console.error('Error submitting checksheet:', error)
      alert('Error submitting checksheet')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!checksheet) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Checksheet not found</h3>
              <p className="text-gray-600 mb-4">
                The checksheet you're trying to execute doesn't exist.
              </p>
              <Button onClick={() => router.push('/execute')}>Back to Execute</Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const currentCheckpoint = checksheet.checkpoints[currentStep]
  const progress = ((currentStep + 1) / checksheet.checkpoints.length) * 100
  const isLastStep = currentStep === checksheet.checkpoints.length - 1

  return (
    <DashboardLayout user={session?.user}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/execute')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Execute
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{checksheet.title}</h1>
          {checksheet.description && (
            <p className="text-gray-600">{checksheet.description}</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep + 1} of {checksheet.checkpoints.length}
            </span>
            <span className="text-sm font-medium text-teal-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-teal-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Checkpoint Card */}
        <Card className="border-0 shadow-lg mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentCheckpoint.title}
                  </h2>
                  {currentCheckpoint.isRequired && (
                    <span className="inline-flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Required
                    </span>
                  )}
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {currentCheckpoint.fieldType}
                </span>
              </div>

              {/* Input based on type */}
              <div className="space-y-4">
                {(currentCheckpoint.fieldType === 'CHECKBOX') && (
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleResponseChange(currentCheckpoint.id, 'value', 'YES')}
                      className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                        responses[currentCheckpoint.id]?.value === 'YES'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <Check className="h-6 w-6 mx-auto mb-2" />
                      <span className="font-semibold">Yes</span>
                    </button>
                    <button
                      onClick={() => handleResponseChange(currentCheckpoint.id, 'value', 'NO')}
                      className={`flex-1 py-4 px-6 rounded-lg border-2 transition-all ${
                        responses[currentCheckpoint.id]?.value === 'NO'
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <X className="h-6 w-6 mx-auto mb-2" />
                      <span className="font-semibold">No</span>
                    </button>
                  </div>
                )}

                {(currentCheckpoint.fieldType === 'NUMBER') && (
                  <div>
                    <Input
                      type="number"
                      value={responses[currentCheckpoint.id]?.value || ''}
                      onChange={(e) => handleResponseChange(currentCheckpoint.id, 'value', e.target.value)}
                      placeholder="Enter a number"
                      className="text-lg py-6"
                    />
                  </div>
                )}

                {(currentCheckpoint.fieldType === 'TEXT' || currentCheckpoint.fieldType === 'TEXTAREA') && (
                  <div>
                    <Input
                      type="text"
                      value={responses[currentCheckpoint.id]?.value || ''}
                      onChange={(e) => handleResponseChange(currentCheckpoint.id, 'value', e.target.value)}
                      placeholder="Enter text"
                      className="text-lg py-6"
                    />
                  </div>
                )}

                {(currentCheckpoint.fieldType === 'DROPDOWN' || currentCheckpoint.fieldType === 'MULTISELECT') && currentCheckpoint.config?.options && (
                  <div className="space-y-2">
                    {currentCheckpoint.config.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => handleResponseChange(currentCheckpoint.id, 'value', option)}
                        className={`w-full py-3 px-4 rounded-lg border-2 text-left transition-all ${
                          responses[currentCheckpoint.id]?.value === option
                            ? 'border-teal-500 bg-teal-50 text-teal-700'
                            : 'border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {(currentCheckpoint.fieldType === 'PHOTO') && (
                  <PhotoUpload
                    value={responses[currentCheckpoint.id]?.photoUrl}
                    onChange={(url) => {
                      handleResponseChange(currentCheckpoint.id, 'photoUrl', url)
                      // Also set value to indicate photo was taken
                      handleResponseChange(currentCheckpoint.id, 'value', 'Photo uploaded')
                    }}
                    onRemove={() => {
                      handleResponseChange(currentCheckpoint.id, 'photoUrl', '')
                      handleResponseChange(currentCheckpoint.id, 'value', '')
                    }}
                  />
                )}

                {/* Notes for this checkpoint */}
                <div>
                  <Label htmlFor="note" className="text-sm font-medium text-gray-700">
                    Notes (Optional)
                  </Label>
                  <textarea
                    id="note"
                    value={responses[currentCheckpoint.id]?.note || ''}
                    onChange={(e) => handleResponseChange(currentCheckpoint.id, 'note', e.target.value)}
                    placeholder="Add any additional notes or observations..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info (only on last step) */}
        {isLastStep && (
          <Card className="border-0 shadow-md mb-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter inspection location"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Overall Notes</Label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any overall notes about this inspection..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500">
            {currentStep + 1} / {checksheet.checkpoints.length}
          </div>

          {!isLastStep ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || submitting}
              className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          )}
        </div>

        {/* Summary of responses (show on last step) */}
        {isLastStep && (
          <Card className="border-0 shadow-md mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Responses</h3>
              <div className="space-y-3">
                {checksheet.checkpoints.map((cp, idx) => (
                  <div key={cp.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {idx + 1}. {cp.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {responses[cp.id]?.value || <span className="text-gray-400 italic">Not answered</span>}
                        </p>
                        {responses[cp.id]?.note && (
                          <p className="text-xs text-gray-500 mt-1">
                            Note: {responses[cp.id].note}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentStep(idx)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
