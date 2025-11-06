'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, MapPin, Camera } from 'lucide-react'

interface ChecksheetFormProps {
  checksheet: any
  onSubmit: (data: any) => void
}

export default function ChecksheetForm({ checksheet, onSubmit }: ChecksheetFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  const handleFileUpload = async (checkpointId: string, file: File) => {
    setUploading({ ...uploading, [checkpointId]: true })
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `checksheets/${checksheet.id}`)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        const currentPhotos = responses[checkpointId]?.photoUrls || []
        setResponses({
          ...responses,
          [checkpointId]: {
            ...responses[checkpointId],
            photoUrls: [...currentPhotos, result.secure_url],
          },
        })
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file')
    } finally {
      setUploading({ ...uploading, [checkpointId]: false })
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Failed to get location')
        }
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formattedResponses = Object.entries(responses).map(([checkpointId, data]) => ({
      checkpointId,
      ...data,
    }))

    onSubmit({
      checksheetId: checksheet.id,
      location: location ? `${location.lat}, ${location.lng}` : undefined,
      gpsLat: location?.lat,
      gpsLng: location?.lng,
      responses: formattedResponses,
    })
  }

  const renderField = (checkpoint: any) => {
    const updateResponse = (field: string, value: any) => {
      setResponses({
        ...responses,
        [checkpoint.id]: {
          ...responses[checkpoint.id],
          [field]: value,
        },
      })
    }

    switch (checkpoint.fieldType) {
      case 'CHECKBOX':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={responses[checkpoint.id]?.boolValue || false}
              onChange={(e) => updateResponse('boolValue', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">Check if applicable</span>
          </div>
        )

      case 'NUMBER':
        return (
          <Input
            type="number"
            value={responses[checkpoint.id]?.numberValue || ''}
            onChange={(e) => updateResponse('numberValue', parseFloat(e.target.value))}
            placeholder="Enter number"
            min={checkpoint.config?.min}
            max={checkpoint.config?.max}
          />
        )

      case 'TEXT':
        return (
          <Input
            type="text"
            value={responses[checkpoint.id]?.textValue || ''}
            onChange={(e) => updateResponse('textValue', e.target.value)}
            placeholder="Enter text"
          />
        )

      case 'TEXTAREA':
        return (
          <textarea
            value={responses[checkpoint.id]?.textValue || ''}
            onChange={(e) => updateResponse('textValue', e.target.value)}
            placeholder="Enter details..."
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
          />
        )

      case 'PHOTO':
        return (
          <div>
            <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
              <Camera className="h-6 w-6 text-gray-400" />
              <span className="text-sm text-gray-600">
                {uploading[checkpoint.id] ? 'Uploading...' : 'Click to upload photo'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(checkpoint.id, file)
                }}
                disabled={uploading[checkpoint.id]}
              />
            </label>
            {responses[checkpoint.id]?.photoUrls?.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {responses[checkpoint.id].photoUrls.map((url: string, index: number) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        )

      case 'DROPDOWN':
        return (
          <select
            value={responses[checkpoint.id]?.textValue || ''}
            onChange={(e) => updateResponse('textValue', e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select option</option>
            {checkpoint.config?.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      case 'GPS':
        return (
          <div>
            <Button type="button" variant="outline" onClick={getLocation}>
              <MapPin className="mr-2 h-4 w-4" />
              Get Current Location
            </Button>
            {responses[checkpoint.id]?.gpsLat && (
              <p className="text-sm text-gray-600 mt-2">
                Location: {responses[checkpoint.id].gpsLat.toFixed(6)}, {responses[checkpoint.id].gpsLng.toFixed(6)}
              </p>
            )}
          </div>
        )

      case 'DATE':
        return (
          <Input
            type="date"
            value={responses[checkpoint.id]?.dateValue || ''}
            onChange={(e) => updateResponse('dateValue', e.target.value)}
          />
        )

      case 'RATING':
        const maxRating = checkpoint.config?.max || 5
        return (
          <div className="flex gap-1">
            {Array.from({ length: maxRating }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => updateResponse('numberValue', index + 1)}
                className={`text-2xl ${
                  (responses[checkpoint.id]?.numberValue || 0) > index
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        )

      default:
        return <p className="text-sm text-gray-500">Unsupported field type</p>
    }
  }

  // Group checkpoints by section
  const sections: Record<string, any[]> = {}
  checksheet.checkpoints?.forEach((checkpoint: any) => {
    const section = checkpoint.section || 'General'
    if (!sections[section]) sections[section] = []
    sections[section].push(checkpoint)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {location && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">
                Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(sections).map(([sectionName, checkpoints]) => (
        <Card key={sectionName}>
          <CardHeader>
            <CardTitle className="text-lg">{sectionName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {checkpoints.map((checkpoint) => (
              <div key={checkpoint.id} className="space-y-2">
                <Label>
                  {checkpoint.title}
                  {checkpoint.isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {checkpoint.description && (
                  <p className="text-sm text-gray-600">{checkpoint.description}</p>
                )}
                {renderField(checkpoint)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline">
          Save Draft
        </Button>
        <Button type="submit">
          Submit Checksheet
        </Button>
      </div>
    </form>
  )
}
