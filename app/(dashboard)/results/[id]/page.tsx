'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  CheckCircle, 
  XCircle, 
  FileText,
  Calendar,
  User,
  MapPin,
  Clock,
  AlertCircle,
  Printer
} from 'lucide-react'

interface Response {
  id: string
  checkpointId: string
  value: string
  note: string | null
  photoUrl: string | null
  checkpoint: {
    title: string
    fieldType: string
    isRequired: boolean
  }
}

interface Result {
  id: string
  status: string
  location: string | null
  notes: string | null
  createdAt: string
  completedAt: string | null
  checksheet: {
    id: string
    title: string
    description: string | null
    category: string | null
  }
  inspector: {
    name: string | null
    email: string
  }
  responses: Response[]
}

export default function ResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchResult()
    }
  }, [params.id])

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/results/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        console.error('Failed to fetch result')
      }
    } catch (error) {
      console.error('Error fetching result:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/results/${params.id}/export`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `result-${params.id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting result:', error)
      alert('Failed to export result')
    }
  }

  if (loading) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!result) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Result not found</h3>
              <p className="text-gray-600 mb-4">
                The execution result you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/reports">
                <Button>Back to Reports</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const passCount = result.responses.filter(r => 
    r.value === 'PASS' || r.value === 'YES'
  ).length
  const failCount = result.responses.filter(r => 
    r.value === 'FAIL' || r.value === 'NO'
  ).length
  const totalResponses = result.responses.length

  return (
    <DashboardLayout user={session?.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 print:mb-4">
          <Link href="/reports" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 print:hidden">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{result.checksheet.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  result.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  result.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {result.status}
                </span>
              </div>
              
              {result.checksheet.description && (
                <p className="text-gray-600 mb-4">
                  {result.checksheet.description}
                </p>
              )}
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{result.inspector.name || result.inspector.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {result.completedAt 
                      ? new Date(result.completedAt).toLocaleString()
                      : `Started ${new Date(result.createdAt).toLocaleString()}`
                    }
                  </span>
                </div>
                {result.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{result.location}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 print:hidden">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={handleExport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{totalResponses}</p>
                </div>
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pass / Yes</p>
                  <p className="text-2xl font-bold text-gray-900">{passCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fail / No</p>
                  <p className="text-2xl font-bold text-gray-900">{failCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses */}
        <Card className="border-0 shadow-md mb-8">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Inspection Responses</h2>
            <div className="space-y-4">
              {result.responses.map((response, idx) => (
                <div key={response.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        {response.checkpoint.title}
                      </p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          response.value === 'PASS' || response.value === 'YES' 
                            ? 'bg-green-100 text-green-700'
                            : response.value === 'FAIL' || response.value === 'NO'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {response.value === 'PASS' || response.value === 'YES' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : response.value === 'FAIL' || response.value === 'NO' ? (
                            <XCircle className="h-4 w-4 mr-1" />
                          ) : null}
                          {response.value}
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          {response.checkpoint.fieldType}
                        </span>
                      </div>
                      {response.note && (
                        <div className="mt-2 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Note:</span> {response.note}
                          </p>
                        </div>
                      )}
                      {response.photoUrl && (
                        <div className="mt-2">
                          <img 
                            src={response.photoUrl} 
                            alt="Response photo" 
                            className="rounded-lg max-w-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Overall Notes */}
        {result.notes && (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Notes</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{result.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
