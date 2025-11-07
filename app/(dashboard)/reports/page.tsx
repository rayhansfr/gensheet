import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BarChart3, Download, FileText, TrendingUp, TrendingDown, Activity, Calendar, Filter } from 'lucide-react'
import ReportsCharts from '@/components/ReportsCharts'

export default async function ReportsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch analytics data
  const [totalResults, completedResults, inProgressResults, recentResults] = await Promise.all([
    prisma.checksheetResult.count({
      where: session.user.role === 'INSPECTOR' ? {
        inspectorId: session.user.id
      } : {}
    }),
    prisma.checksheetResult.count({
      where: {
        status: 'COMPLETED',
        ...(session.user.role === 'INSPECTOR' ? { inspectorId: session.user.id } : {})
      }
    }),
    prisma.checksheetResult.count({
      where: {
        status: 'IN_PROGRESS',
        ...(session.user.role === 'INSPECTOR' ? { inspectorId: session.user.id } : {})
      }
    }),
    prisma.checksheetResult.findMany({
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
      take: 10
    })
  ])

  const completionRate = totalResults > 0 ? Math.round((completedResults / totalResults) * 100) : 0

  // Fetch trend data (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const trendData = await prisma.checksheetResult.groupBy({
    by: ['createdAt'],
    where: {
      createdAt: { gte: thirtyDaysAgo },
      ...(session.user.role === 'INSPECTOR' ? { inspectorId: session.user.id } : {})
    },
    _count: true,
  })

  // Group by day
  const dailyTrend = trendData.reduce((acc: any, item) => {
    const date = new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    acc[date] = (acc[date] || 0) + item._count
    return acc
  }, {})

  const trendChartData = Object.entries(dailyTrend).map(([date, count]) => ({
    date,
    executions: count
  })).slice(-7) // Last 7 days

  // Fetch category distribution
  const categoryData = await prisma.checksheet.groupBy({
    by: ['category'],
    _count: true,
    where: session.user.role === 'INSPECTOR' ? {
      creatorId: session.user.id
    } : {}
  })

  const categoryChartData = categoryData
    .filter(item => item.category)
    .map(item => ({
      category: item.category || 'Other',
      count: item._count
    }))

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-2 text-gray-600">
                Track performance and generate insights
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <Activity className="h-5 w-5 text-teal-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalResults}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+12% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{completedResults}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+8% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{inProgressResults}</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-orange-600">
                <TrendingDown className="h-4 w-4" />
                <span>-3% from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <BarChart3 className="h-5 w-5 text-teal-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{completionRate}%</p>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+5% from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <ReportsCharts 
          trendData={trendChartData} 
          categoryData={categoryChartData}
        />

        {/* Top Checksheets */}
        <Card className="border-0 shadow-lg mb-8 bg-white">
          <CardContent className="pt-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">Most Used Checksheets</h3>
            <div className="space-y-3">
              {[
                { name: 'Daily Safety Inspection', count: 145, trend: '+12%' },
                { name: 'Quality Control Check', count: 98, trend: '+8%' },
                { name: 'Equipment Maintenance', count: 76, trend: '+5%' },
                { name: 'Security Patrol', count: 54, trend: '+3%' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-green-500">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.count} executions</p>
                    </div>
                  </div>
                  <span className="text-sm text-green-600 font-medium">{item.trend}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900">Recent Activity</h3>
              <Link href="/results">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {recentResults.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No activity yet</p>
                </div>
              ) : (
                recentResults.map((result: any) => (
                  <Link
                    key={result.id}
                    href={`/results/${result.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {result.checksheet.title}
                        </h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(result.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span>by {result.inspector?.name || result.inspector?.email}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        result.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        result.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {result.status}
                      </span>
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
