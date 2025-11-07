import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import DashboardLayout from '@/components/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, BookOpen, Star, TrendingUp, Award, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const BEST_PRACTICES = [
  {
    category: 'Getting Started',
    icon: BookOpen,
    color: 'bg-blue-500',
    tips: [
      {
        title: 'Define Clear Objectives',
        description: 'Before creating a checksheet, clearly define what you want to achieve. This helps in designing relevant checkpoints.',
        impact: 'High'
      },
      {
        title: 'Use Templates',
        description: 'Start with industry-standard templates and customize them to your needs. This saves time and ensures you don\'t miss critical points.',
        impact: 'Medium'
      },
      {
        title: 'Keep It Simple',
        description: 'Don\'t overcomplicate your checksheets. Focus on essential items that truly matter for your inspection or audit.',
        impact: 'High'
      },
    ]
  },
  {
    category: 'Design Tips',
    icon: Lightbulb,
    color: 'bg-purple-500',
    tips: [
      {
        title: 'Logical Grouping',
        description: 'Group related checkpoints together using sections. This makes execution faster and more organized.',
        impact: 'Medium'
      },
      {
        title: 'Clear Questions',
        description: 'Write checkpoint questions that are specific, measurable, and easy to understand. Avoid ambiguous language.',
        impact: 'High'
      },
      {
        title: 'Choose Right Field Types',
        description: 'Use appropriate field types for each checkpoint. Photos for visual verification, GPS for location tracking, etc.',
        impact: 'Medium'
      },
    ]
  },
  {
    category: 'Execution',
    icon: CheckCircle,
    color: 'bg-green-500',
    tips: [
      {
        title: 'Photo Evidence',
        description: 'Require photos for critical checkpoints. Visual evidence is invaluable for documentation and compliance.',
        impact: 'High'
      },
      {
        title: 'Add Notes',
        description: 'Encourage inspectors to add detailed notes, especially for failed items. This helps in root cause analysis.',
        impact: 'Medium'
      },
      {
        title: 'Real-time Execution',
        description: 'Execute checksheets in real-time during inspections rather than filling them out from memory later.',
        impact: 'High'
      },
    ]
  },
  {
    category: 'Optimization',
    icon: TrendingUp,
    color: 'bg-orange-500',
    tips: [
      {
        title: 'Regular Reviews',
        description: 'Review and update your checksheets regularly based on feedback and changing requirements.',
        impact: 'High'
      },
      {
        title: 'Track Metrics',
        description: 'Monitor completion rates, failure patterns, and execution times to identify areas for improvement.',
        impact: 'Medium'
      },
      {
        title: 'Standardize Across Teams',
        description: 'Use consistent checksheets across different teams and locations for better comparability.',
        impact: 'Medium'
      },
    ]
  },
]

const SUCCESS_STORIES = [
  {
    company: 'Manufacturing Corp',
    industry: 'Manufacturing',
    result: '40% reduction in equipment downtime',
    description: 'Implemented daily equipment inspection checksheets with photo requirements',
  },
  {
    company: 'SafeBuild Construction',
    industry: 'Construction',
    result: '100% compliance with safety audits',
    description: 'Standardized safety inspection checksheets across all construction sites',
  },
  {
    company: 'MediCare Hospital',
    industry: 'Healthcare',
    result: '25% faster patient handoffs',
    description: 'Digital checksheets for patient handoff procedures reduced errors',
  },
]

export default async function BestPracticesPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Best Practices</h1>
              <p className="text-gray-600">
                Learn how to create and manage effective checksheets
              </p>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <Card className="border-0 shadow-lg mb-8 bg-gradient-to-br from-teal-50 to-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Quick Start Guide</h2>
                <p className="text-gray-700 mb-4">
                  New to GenSheet? Follow these steps to create your first checksheet:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600 mb-2">1</div>
                    <h3 className="font-semibold text-gray-900 mb-1">Choose Template</h3>
                    <p className="text-sm text-gray-600">Browse our library or use AI to generate</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600 mb-2">2</div>
                    <h3 className="font-semibold text-gray-900 mb-1">Customize</h3>
                    <p className="text-sm text-gray-600">Add checkpoints and configure fields</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600 mb-2">3</div>
                    <h3 className="font-semibold text-gray-900 mb-1">Execute</h3>
                    <p className="text-sm text-gray-600">Start using in real inspections</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Practices by Category */}
        <div className="space-y-8 mb-12">
          {BEST_PRACTICES.map((category, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${category.color}`}>
                  <category.icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {category.tips.map((tip, tipIdx) => (
                  <Card key={tipIdx} className="border-0 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900">{tip.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tip.impact === 'High' ? 'bg-red-100 text-red-700' :
                          tip.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {tip.impact} Impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{tip.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>


        {/* CTA Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-500 to-green-500">
          <CardContent className="pt-8 pb-8">
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="mb-6 text-teal-100">
                Apply these best practices to create effective checksheets for your organization
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="bg-white text-teal-600 hover:bg-gray-100">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Templates
                  </Button>
                </Link>
                <Link href="/checksheets/create">
                  <Button size="lg" className="bg-white text-teal-600 hover:bg-gray-100">
                    <ArrowRight className="mr-2 h-5 w-5" />
                    Create Checksheet
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
