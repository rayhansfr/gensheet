import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, FileText, Grid3x3, List, Search, Filter, Clock, CheckCircle, XCircle } from 'lucide-react'

export default async function ChecksheetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; category?: string; view?: string }>
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const params = await searchParams
  const search = params.search || ''
  const status = params.status || 'all'
  const category = params.category || 'all'
  const view = params.view || 'grid'

  // Build filter conditions
  const where: any = {}
  
  if (session.user.role !== 'ADMIN') {
    where.OR = [
      { creatorId: session.user.id },
      { organizationId: session.user.organizationId || undefined },
    ]
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (status !== 'all') {
    where.status = status.toUpperCase()
  }

  if (category !== 'all') {
    where.category = category
  }

  const checksheets = await prisma.checksheet.findMany({
    where,
    include: {
      creator: {
        select: { name: true, email: true }
      },
      _count: {
        select: { checkpoints: true, results: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
  })

  const stats = {
    total: checksheets.length,
    active: checksheets.filter((c: any) => c.status === 'ACTIVE').length,
    draft: checksheets.filter((c: any) => c.status === 'DRAFT').length,
    archived: checksheets.filter((c: any) => c.status === 'ARCHIVED').length,
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Checksheets</h1>
              <p className="mt-2 text-gray-600">
                Manage all your checksheet templates
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link href="/checksheets/create">
                <Button size="lg" className="bg-gradient-to-r text-white from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 shadow-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Archived</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.archived}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search checksheets..."
                  className="pl-10 bg-white border-gray-300"
                  defaultValue={search}
                  name="search"
                />
              </div>

              {/* Status Filter */}
              <select
                name="status"
                defaultValue={status}
                className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Link href="?view=grid">
                  <Button variant={view === 'grid' ? 'default' : 'outline'} size="icon">
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="?view=list">
                  <Button variant={view === 'list' ? 'default' : 'outline'} size="icon">
                    <List className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checksheets Grid/List */}
        {checksheets.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No checksheets found</h3>
                <p className="text-gray-600 mb-4">
                  {search ? 'Try adjusting your search filters' : 'Create your first checksheet to get started'}
                </p>
                <Link href="/checksheets/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Checksheet
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : view === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checksheets.map((checksheet: any) => (
              <Link key={checksheet.id} href={`/checksheets/${checksheet.id}`}>
                <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer h-full">
                  <CardContent className="pt-6">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        checksheet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        checksheet.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {checksheet.status}
                      </span>
                      {checksheet.category && (
                        <span className="text-xs text-gray-500 capitalize">
                          {checksheet.category}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                      {checksheet.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {checksheet.description || 'No description'}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{checksheet._count.checkpoints}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        <span>{checksheet._count.results}</span>
                      </div>
                    </div>

                    {/* Creator */}
                    <div className="mt-4 text-xs text-gray-500">
                      by {checksheet.creator.name || checksheet.creator.email}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {checksheets.map((checksheet: any) => (
                  <Link
                    key={checksheet.id}
                    href={`/checksheets/${checksheet.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{checksheet.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            checksheet.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            checksheet.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {checksheet.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {checksheet.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{checksheet._count.checkpoints} checkpoints</span>
                          <span>{checksheet._count.results} results</span>
                          {checksheet.category && <span className="capitalize">{checksheet.category}</span>}
                          <span className="text-xs">by {checksheet.creator.name || checksheet.creator.email}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
