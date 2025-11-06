import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Play, FileText, Clock, MapPin, Calendar, CheckCircle, AlertCircle } from 'lucide-react'

export default async function ExecutePage({
  searchParams,
}: {
  searchParams: { search?: string; checksheet?: string }
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const search = searchParams.search || ''
  const preselectedChecksheet = searchParams.checksheet || null

  // Fetch active checksheets for execution
  const where: any = { status: 'ACTIVE' }
  
  if (session.user.role !== 'ADMIN') {
    where.OR = [
      { creatorId: session.user.id },
      { organizationId: session.user.organizationId || undefined },
    ]
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }
    ]
  }

  const checksheets = await prisma.checksheet.findMany({
    where,
    include: {
      _count: {
        select: { checkpoints: true, results: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Fetch recent executions
  const recentExecutions = await prisma.checksheetResult.findMany({
    where: session.user.role === 'INSPECTOR' ? {
      inspectorId: session.user.id
    } : {},
    include: {
      checksheet: {
        select: { title: true }
      },
      inspector: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Execute Checksheet</h1>
          <p className="mt-2 text-gray-600">
            Fill out checksheets and record inspections
          </p>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search checksheets to execute..."
                className="pl-10 bg-white border-gray-300"
                defaultValue={search}
                name="search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Available Checksheets */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Checksheets</h2>
          {checksheets.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-12 pb-12">
                <div className="text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No active checksheets</h3>
                  <p className="text-gray-600">
                    {search ? 'Try adjusting your search' : 'Create a checksheet first to start executing'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {checksheets.map((checksheet: any) => (
                <Link key={checksheet.id} href={`/execute/run?checksheet=${checksheet.id}`}>
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="pt-6">
                      {/* Icon */}
                      <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500 w-fit mb-4">
                        <FileText className="h-6 w-6 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                        {checksheet.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {checksheet.description || 'No description'}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4 mb-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>{checksheet._count.checkpoints} items</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{checksheet._count.results} runs</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="w-full bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                        <Play className="mr-2 h-4 w-4" />
                        Start Execution
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Executions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Executions</h2>
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              {recentExecutions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No executions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentExecutions.map((execution: any) => (
                    <Link
                      key={execution.id}
                      href={`/results/${execution.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {execution.checksheet.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(execution.createdAt).toLocaleDateString()}</span>
                            </div>
                            {execution.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{execution.location}</span>
                              </div>
                            )}
                            <span>by {execution.inspector?.name || execution.inspector?.email}</span>
                          </div>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            execution.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                            execution.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {execution.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
