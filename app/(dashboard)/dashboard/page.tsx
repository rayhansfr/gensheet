import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import DashboardLayout from '@/components/DashboardLayout'
import { Plus, FileText, CheckCircle, Clock, TrendingUp, AlertCircle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch statistics
  const [totalChecksheets, totalResults, pendingResults, recentChecksheets] = await Promise.all([
    prisma.checksheet.count({
      where: session.user.role === 'ADMIN' ? {} : {
        OR: [
          { creatorId: session.user.id },
          { organizationId: session.user.organizationId || undefined },
        ]
      }
    }),
    prisma.checksheetResult.count({
      where: session.user.role === 'INSPECTOR' ? {
        inspectorId: session.user.id
      } : {}
    }),
    prisma.checksheetResult.count({
      where: {
        status: 'IN_PROGRESS',
        ...(session.user.role === 'INSPECTOR' ? { inspectorId: session.user.id } : {})
      }
    }),
    prisma.checksheet.findMany({
      where: session.user.role === 'ADMIN' ? {} : {
        OR: [
          { creatorId: session.user.id },
          { organizationId: session.user.organizationId || undefined },
        ]
      },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        _count: {
          select: { checkpoints: true, results: true }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 5
    })
  ])

  const stats = [
    {
      title: 'Total Checksheets',
      value: totalChecksheets,
      icon: FileText,
      gradient: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
    {
      title: 'Completed Today',
      value: totalResults,
      icon: CheckCircle,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'In Progress',
      value: pendingResults,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Compliance Rate',
      value: '94%',
      icon: TrendingUp,
      gradient: 'from-teal-500 to-green-600',
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
    },
  ]

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to GenSheet Master
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your checksheets efficiently across global industries
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/checksheets/create">
                <Button size="lg" className="bg-gradient-to-r text-white from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Checksheet
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg bg-white transition-shadow duration-200 border-0 shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Link href="/checksheets/create" className="block">
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-teal-600">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Create Checksheet</h3>
                    <p className="text-sm text-gray-600">Build custom checksheet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/ai" className="block">
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-600">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-sm text-gray-600">Generate with AI</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/templates" className="block">
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-600">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">Templates</h3>
                    <p className="text-sm text-gray-600">Browse library</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Checksheets */}
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Checksheets</h2>
              <Link href="/checksheets">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="space-y-4 border-t border-gray-200 pt-4">
              {recentChecksheets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No checksheets yet. Create your first one!</p>
                  <Link href="/checksheets/create">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Checksheet
                    </Button>
                  </Link>
                </div>
              ) : (
                recentChecksheets.map((checksheet: any) => (
                  <Link
                    key={checksheet.id}
                    href={`/checksheets/${checksheet.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{checksheet.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {checksheet.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{checksheet._count.checkpoints} checkpoints</span>
                          <span>{checksheet._count.results} results</span>
                          <span className="capitalize">{checksheet.category || 'Uncategorized'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          checksheet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          checksheet.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {checksheet.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
