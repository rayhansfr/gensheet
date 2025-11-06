import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateChecksheet } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, category } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const result = await generateChecksheet(prompt, category)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error in AI generation:', error)
    return NextResponse.json(
      { error: 'Failed to generate checksheet' },
      { status: 500 }
    )
  }
}
