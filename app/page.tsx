import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckSquare, Sparkles, BarChart3, Users, Globe, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold">GenSheet</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-600 px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Checksheet Platform</span>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent">
            Create Custom Checksheets for Any Industry
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Build, manage, and execute checksheets with AI assistance. 
            Perfect for manufacturing, construction, healthcare, IT, and more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/checksheets/create">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Create Checksheet
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <Sparkles className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">AI Generation</h3>
              <p className="text-gray-600">
                Generate checksheets instantly with AI based on your industry and requirements.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <CheckSquare className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Custom Fields</h3>
              <p className="text-gray-600">
                Support for checkboxes, numbers, photos, GPS, signatures, and more field types.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <BarChart3 className="h-12 w-12 text-teal-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
              <p className="text-gray-600">
                Visualize data, export to Excel/PDF, and track performance over time.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <Users className="h-12 w-12 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Role Management</h3>
              <p className="text-gray-600">
                Admin, Supervisor, Inspector, and Viewer roles with granular permissions.
              </p>
            </div>
            <div className="p-6 border rounded-lg">
              <Shield className="h-12 w-12 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Secure & Compliant</h3>
              <p className="text-gray-600">
                Enterprise-grade security with cloud storage and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Built for Every Industry</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              'Manufacturing',
              'Construction',
              'Healthcare',
              'IT & Software',
              'Safety & Compliance',
              'Quality Control',
              'Maintenance',
              'Audit & Inspection',
            ].map((industry) => (
              <div key={industry} className="p-4 bg-white border rounded-lg text-center hover:shadow-lg transition">
                <span className="font-medium">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-500 to-green-500 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams using GenSheet to streamline their operations.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Try GenSheet Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 GenSheet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
