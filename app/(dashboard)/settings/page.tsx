'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Building2, Bell, Shield, Globe, Save, Mail, Phone, Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    image: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (session?.user) {
      setProfileData({
        name: session.user.name || '',
        phone: '',
        image: session.user.image || ''
      })
    }
  }, [status, router, session])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (res.ok) {
        await update() // Refresh session
        alert('Profile updated successfully!')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'organization', name: 'Organization', icon: Building2 },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Globe },
  ]

  if (status === 'loading' || !session?.user) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-white shadow-md">
              <CardContent className="pt-6">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card className="border-0 bg-white shadow-lg">
              <CardContent className="pt-6">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Update your personal information and profile details
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                            className="mt-2 bg-white border-gray-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={session.user.email || ''}
                            className="mt-2 bg-white border-gray-300"
                            disabled
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            placeholder="+1 (555) 000-0000"
                            className="mt-2 bg-white border-gray-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Input
                            id="role"
                            value={session.user.role}
                            className="mt-2 bg-white border-gray-300"
                            disabled
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="avatar">Profile Picture URL</Label>
                        <Input
                          id="avatar"
                          type="url"
                          value={profileData.image}
                          onChange={(e) => setProfileData({...profileData, image: e.target.value})}
                          placeholder="https://example.com/avatar.jpg"
                          className="mt-2 bg-white border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-gradient-to-r text-white from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Organization Settings */}
                {activeTab === 'organization' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Organization</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Manage your organization settings and team members
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                          id="org-name"
                          placeholder="Acme Corporation"
                          className="mt-2 bg-white border-gray-300"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="industry">Industry</Label>
                          <select
                            id="industry"
                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option>Manufacturing</option>
                            <option>Construction</option>
                            <option>Healthcare</option>
                            <option>Logistics</option>
                            <option>Other</option>
                          </select>
                        </div>
                        <div>
                          <Label htmlFor="size">Company Size</Label>
                          <select
                            id="size"
                            className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option>1-10 employees</option>
                            <option>11-50 employees</option>
                            <option>51-200 employees</option>
                            <option>201-500 employees</option>
                            <option>500+ employees</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          placeholder="123 Main St, City, Country"
                          className="mt-2 bg-white border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Notification Preferences</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Choose what notifications you want to receive
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'email-checksheet', label: 'New checksheet assigned', description: 'Get notified when a checksheet is assigned to you' },
                        { id: 'email-result', label: 'Execution completed', description: 'Get notified when an execution is completed' },
                        { id: 'email-comment', label: 'Comments and mentions', description: 'Get notified when someone mentions you' },
                        { id: 'email-reminder', label: 'Execution reminders', description: 'Get reminded about pending executions' },
                        { id: 'push-enabled', label: 'Push notifications', description: 'Receive push notifications on your devices' },
                      ].map((item) => (
                        <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <input
                            type="checkbox"
                            id={item.id}
                            className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            defaultChecked
                          />
                          <div className="flex-1">
                            <label htmlFor={item.id} className="font-medium text-gray-900 cursor-pointer">
                              {item.label}
                            </label>
                            <p className="text-sm text-gray-600">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Manage your password and security settings
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          className="mt-2 bg-white border-gray-300"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            className="mt-2 bg-white border-gray-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm Password</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            className="mt-2 bg-white border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                        <h3 className="font-semibold text-teal-900 mb-2">Two-Factor Authentication</h3>
                        <p className="text-sm text-teal-800 mb-3">
                          Add an extra layer of security to your account
                        </p>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                        <Save className="mr-2 h-4 w-4" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preferences Settings */}
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Preferences</h2>
                      <p className="text-sm text-gray-600 mb-6">
                        Customize your GenSheet experience
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="language">Language</Label>
                        <select
                          id="language"
                          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                          <option>English</option>
                          <option>Indonesian</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Chinese</option>
                          <option>Japanese</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="timezone">Timezone</Label>
                        <select
                          id="timezone"
                          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                          <option>UTC</option>
                          <option>Asia/Jakarta (UTC+7)</option>
                          <option>America/New_York (UTC-5)</option>
                          <option>Europe/London (UTC+0)</option>
                          <option>Asia/Tokyo (UTC+9)</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="date-format">Date Format</Label>
                        <select
                          id="date-format"
                          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                        >
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">Dark Mode</h3>
                            <p className="text-sm text-gray-600">Use dark theme</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            defaultChecked={false}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600">
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
