'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Swal from 'sweetalert2'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  FileText, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Share2,
  Copy,
  BarChart3,
  Settings,
  Archive,
  Eye
} from 'lucide-react'
import { useSession } from 'next-auth/react'

interface Checkpoint {
  id: string
  order: number
  title: string
  fieldType: string
  isRequired: boolean
  config?: any
}

interface ChecksheetResult {
  id: string
  completedAt: string | null
  status: string
  inspector: {
    name: string | null
    email: string
  }
  responses: any[]
}

interface Checksheet {
  id: string
  title: string
  description: string | null
  category: string | null
  status: string
  version: number
  createdAt: string
  updatedAt: string
  creator: {
    name: string | null
    email: string
  }
  checkpoints: Checkpoint[]
  results: ChecksheetResult[]
  _count: {
    results: number
    assignments: number
  }
}

export default function ChecksheetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [checksheet, setChecksheet] = useState<Checksheet | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'checkpoints' | 'results'>('overview')
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchChecksheet()
    }
  }, [params.id])

  const fetchChecksheet = async () => {
    try {
      const res = await fetch(`/api/checksheets/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setChecksheet(data)
      } else {
        console.error('Failed to fetch checksheet')
      }
    } catch (error) {
      console.error('Error fetching checksheet:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This checksheet will be permanently deleted. This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/checksheets/${params.id}`, {
        method: 'DELETE',
      })
      
      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Checksheet has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false
        })
        router.push('/checksheets')
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to delete checksheet',
        })
      }
    } catch (error) {
      console.error('Error deleting checksheet:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error deleting checksheet',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/checksheets/${params.id}/duplicate`, {
        method: 'POST',
      })
      
      if (res.ok) {
        const newChecksheet = await res.json()
        await Swal.fire({
          icon: 'success',
          title: 'Duplicated!',
          text: 'Checksheet has been duplicated successfully.',
          timer: 2000,
          showConfirmButton: false
        })
        router.push(`/checksheets/${newChecksheet.id}`)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to duplicate checksheet',
        })
      }
    } catch (error) {
      console.error('Error duplicating checksheet:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error duplicating checksheet',
      })
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/checksheets/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        fetchChecksheet()
        Swal.fire({
          icon: 'success',
          title: 'Status Updated!',
          text: `Status changed to ${newStatus}`,
          timer: 2000,
          showConfirmButton: false
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to update status',
        })
      }
    } catch (error) {
      console.error('Error updating status:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error updating status',
      })
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

  if (!checksheet) {
    return (
      <DashboardLayout user={session?.user}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Checksheet not found</h3>
              <p className="text-gray-600 mb-4">
                The checksheet you're looking for doesn't exist or you don't have access to it.
              </p>
              <Link href="/checksheets">
                <Button>Back to Checksheets</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const completionRate = checksheet._count.results > 0 
    ? Math.round((checksheet.results.filter(r => r.status === 'COMPLETED').length / checksheet._count.results) * 100)
    : 0

  return (
    <DashboardLayout user={session?.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/checksheets" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Checksheets
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{checksheet.title}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  checksheet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  checksheet.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {checksheet.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">
                {checksheet.description || 'No description provided'}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{checksheet.creator.name || checksheet.creator.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(checksheet.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>v{checksheet.version}</span>
                </div>
                {checksheet.category && (
                  <div className="flex items-center gap-2">
                    <span className="capitalize">{checksheet.category}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href={`/execute/run?checksheet=${checksheet.id}`}>
                <Button className="bg-gradient-to-r text-white from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Run Checksheet
                </Button>
              </Link>
              
              <div className="relative">
                <Button 
                  variant="outline"
                  onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                  onMouseEnter={() => setSettingsMenuOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {settingsMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                    onMouseLeave={() => setSettingsMenuOpen(false)}
                  >
                    <Link href={`/checksheets/${checksheet.id}/edit`}>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={handleDuplicate}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(checksheet.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE')
                        setSettingsMenuOpen(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Archive className="h-4 w-4" />
                      {checksheet.status === 'ACTIVE' ? 'Archive' : 'Activate'}
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => {
                        handleDelete()
                        setSettingsMenuOpen(false)
                      }}
                      disabled={deleting}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Executions</p>
                  <p className="text-2xl font-bold text-gray-900">{checksheet._count.results}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Checkpoints</p>
                  <p className="text-2xl font-bold text-gray-900">{checksheet.checkpoints.length}</p>
                </div>
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{checksheet._count.assignments}</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('checkpoints')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'checkpoints'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Checkpoints ({checksheet.checkpoints.length})
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Results ({checksheet._count.results})
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Checksheet Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Title</dt>
                    <dd className="mt-1 text-sm text-gray-900">{checksheet.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">{checksheet.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{checksheet.category || 'Uncategorized'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Version</dt>
                    <dd className="mt-1 text-sm text-gray-900">v{checksheet.version}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Created By</dt>
                    <dd className="mt-1 text-sm text-gray-900">{checksheet.creator.name || checksheet.creator.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Last Updated</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(checksheet.updatedAt).toLocaleString()}</dd>
                  </div>
                  {checksheet.description && (
                    <div className="md:col-span-2">
                      <dt className="text-sm font-medium text-gray-600">Description</dt>
                      <dd className="mt-1 text-sm text-gray-900">{checksheet.description}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'checkpoints' && (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkpoints</h3>
              <div className="space-y-3">
                {checksheet.checkpoints.map((checkpoint, index) => (
                  <div key={checkpoint.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-gray-900">{checkpoint.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                              {checkpoint.fieldType}
                            </span>
                            {checkpoint.isRequired && (
                              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        {checkpoint.config?.options && checkpoint.config.options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-600 mb-1">Options:</p>
                            <div className="flex flex-wrap gap-2">
                              {checkpoint.config.options.map((option: string, idx: number) => (
                                <span key={idx} className="text-xs px-2 py-1 bg-white border border-gray-200 rounded">
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'results' && (
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Execution Results</h3>
              {checksheet.results.length > 0 ? (
                <div className="space-y-3">
                  {checksheet.results.map((result) => (
                    <Link key={result.id} href={`/results/${result.id}`}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              result.status === 'COMPLETED' ? 'bg-green-100' :
                              result.status === 'IN_PROGRESS' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              {result.status === 'COMPLETED' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : result.status === 'IN_PROGRESS' ? (
                                <Clock className="h-5 w-5 text-yellow-600" />
                              ) : (
                                <FileText className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {result.inspector.name || result.inspector.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                {result.completedAt 
                                  ? `Completed ${new Date(result.completedAt).toLocaleString()}`
                                  : 'In Progress'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              result.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              result.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {result.status}
                            </span>
                            <Eye className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No execution results yet</p>
                  <Link href={`/execute/run?checksheet=${checksheet.id}`}>
                    <Button className="mt-4 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700">
                      <Play className="h-4 w-4 mr-2" />
                      Run First Execution
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
