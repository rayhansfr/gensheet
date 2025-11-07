import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, Star, Copy, FileText, Factory, Building2, Heart, Truck, Users, Shield, Zap } from 'lucide-react'
import CloneTemplateButton from '@/components/CloneTemplateButton'

const CATEGORIES = [
  { id: 'manufacturing', name: 'Manufacturing', icon: Factory, color: 'bg-teal-500' },
  { id: 'construction', name: 'Construction', icon: Building2, color: 'bg-orange-500' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'bg-red-500' },
  { id: 'logistics', name: 'Logistics', icon: Truck, color: 'bg-green-500' },
  { id: 'hr', name: 'Human Resources', icon: Users, color: 'bg-teal-600' },
  { id: 'safety', name: 'Safety & Security', icon: Shield, color: 'bg-yellow-500' },
  { id: 'other', name: 'Other', icon: Zap, color: 'bg-gray-500' },
]

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string }>
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const params = await searchParams
  const search = params.search || ''
  const categoryFilter = params.category || 'all'

  // Fetch best practice templates
  const where: any = { isPublic: true }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (categoryFilter !== 'all') {
    where.category = categoryFilter
  }

  const templates = await prisma.bestPracticeTemplate.findMany({
    where,
    orderBy: { usageCount: 'desc' },
  })

  const handleClone = async (templateId: string) => {
    'use server'
    // This would create a new checksheet from template
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Template Library</h1>
          <p className="mt-2 text-gray-600">
            Browse and use industry-standard checksheet templates
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Link href="/templates?category=all">
              <Card className={`border-0 shadow-md bg-white hover:shadow-lg transition-all cursor-pointer ${
                categoryFilter === 'all' ? 'ring-2 ring-teal-500' : ''
              }`}>
                <CardContent className="pt-6 text-center">
                  <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500 mx-auto w-fit mb-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">All</p>
                </CardContent>
              </Card>
            </Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.id} href={`/templates?category=${cat.id}`}>
                <Card className={`border-0 bg-white h-full shadow-md hover:shadow-lg transition-all cursor-pointer ${
                  categoryFilter === cat.id ? 'ring-2 ring-teal-500' : ''
                }`}>
                  <CardContent className="pt-6 text-center">
                    <div className={`p-3 rounded-full ${cat.color} mx-auto w-fit mb-3`}>
                      <cat.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Search */}
        <Card className="border-0 bg-white shadow-md mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                className="pl-10 bg-white border-gray-300"
                defaultValue={search}
                name="search"
              />
            </div>
          </CardContent>
        </Card>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="pt-12 pb-12">
              <div className="text-center text-gray-500">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or category filter
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template: any) => {
              const category = CATEGORIES.find(c => c.id === template.category)
              return (
                <Card key={template.id} className="border-0  bg-white shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <CardContent className="pt-6">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      {category && (
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-full ${category.color}`}>
                            <category.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {category.name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs font-medium">{template.usageCount || 0}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                      {template.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {template.description || 'No description'}
                    </p>

                    {/* Tags */}
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(template.tags as string[]).slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 border-t border-gray-200 pt-4">
                      <Link href={`/templates/${template.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </Link>
                      <CloneTemplateButton 
                        templateId={template.id}
                        className="flex-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Popular Templates Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular This Month</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Daily Safety Inspection', 'Quality Control Check', 'Equipment Maintenance', 'Security Patrol'].map((title, idx) => (
              <Card key={idx} className="border-0 bg-white shadow-md hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-green-500">
                      <Star className="h-5 w-5 text-white fill-current" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Used by 150+ organizations
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Copy className="mr-2 h-4 w-4" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
