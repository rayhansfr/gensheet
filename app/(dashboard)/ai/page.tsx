'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sparkles, Send, Bot, User, Loader2, FileText, Copy, Check } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  checksheet?: any
}

export default function AIAssistantPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you generate custom checksheets for any industry or use case. Just describe what you need, and I\'ll create it for you. For example: "Create a daily safety inspection checksheet for a manufacturing plant"'
    }
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isGenerating) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      })

      const data = await response.json()

      if (response.ok && data.checksheet) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: `I've created a checksheet for you: "${data.checksheet.title}". You can review it below and save it to your library.`,
          checksheet: data.checksheet
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: data.error || 'Sorry, I encountered an error generating your checksheet. Please try again with a different description.'
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again later.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveChecksheet = async (checksheet: any, messageIndex: number) => {
    try {
      const response = await fetch('/api/checksheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checksheet)
      })

      if (response.ok) {
        const saved = await response.json()
        setCopiedId(messageIndex)
        setTimeout(() => {
          router.push(`/checksheets/${saved.id}`)
        }, 1000)
      }
    } catch (error) {
      console.error('Error saving checksheet:', error)
    }
  }

  if (status === 'loading' || !session?.user) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout user={session.user}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-gradient-to-r from-teal-500 to-green-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
              <p className="text-gray-600">Generate checksheets with artificial intelligence</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 border-0 shadow-lg bg-white overflow-hidden mb-4">
          <CardContent className="p-6 h-full overflow-y-auto">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-green-500 h-fit">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-3xl ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-teal-500 to-green-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Checksheet Preview */}
                    {message.checksheet && (
                      <Card className="mt-4 border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900">
                                {message.checksheet.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {message.checksheet.description}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                              {message.checksheet.category || 'General'}
                            </span>
                          </div>

                          {/* Checkpoints Preview */}
                          <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                            {message.checksheet.checkpoints?.slice(0, 5).map((cp: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{cp.question}</span>
                                <span className="ml-auto text-xs text-gray-500">{cp.type}</span>
                              </div>
                            ))}
                            {message.checksheet.checkpoints?.length > 5 && (
                              <p className="text-xs text-gray-500 text-center">
                                +{message.checksheet.checkpoints.length - 5} more checkpoints
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSaveChecksheet(message.checksheet, index)}
                              className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
                              disabled={copiedId === index}
                            >
                              {copiedId === index ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Saved!
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Save to Library
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="p-2 rounded-full bg-gray-200 h-fit">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-4 justify-start">
                  <div className="p-2 rounded-full bg-gradient-to-r from-teal-500 to-green-500 h-fit">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                      <p className="text-gray-600">Generating your checksheet...</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="border-0 bg-white shadow-lg">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the checksheet you want to create..."
                className="flex-1 bg-white border-gray-300"
                disabled={isGenerating}
              />
              <Button 
                type="submit" 
                disabled={isGenerating || !input.trim()}
                className="bg-gradient-to-r text-white from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Generate
                  </>
                )}
              </Button>
            </form>

            {/* Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <p className="text-xs text-gray-500 w-full">Try these:</p>
              {[
                'Daily safety inspection for construction site',
                'Quality control for manufacturing',
                'Restaurant hygiene checklist',
                'IT equipment maintenance'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors"
                  disabled={isGenerating}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
