import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query || query.length < 2) {
      return NextResponse.json({ checksheets: [], templates: [], results: [] })
    }

    const searchCondition = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as const } },
        { description: { contains: query, mode: 'insensitive' as const } },
      ]
    }

    // Search checksheets
    const checksheets = await prisma.checksheet.findMany({
      where: {
        ...searchCondition,
        ...(session.user.role !== 'ADMIN' ? {
          OR: [
            { creatorId: session.user.id },
            { organizationId: session.user.organizationId || undefined },
          ]
        } : {})
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        status: true,
        createdAt: true
      },
      take: 5
    })

    // Search templates
    const templates = await prisma.bestPracticeTemplate.findMany({
      where: {
        ...searchCondition,
        isPublic: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        usageCount: true
      },
      take: 5
    })

    // Search results
    const results = await prisma.checksheetResult.findMany({
      where: {
        ...(session.user.role === 'INSPECTOR' ? {
          inspectorId: session.user.id
        } : {}),
        checksheet: searchCondition
      },
      include: {
        checksheet: {
          select: {
            title: true
          }
        },
        inspector: {
          select: {
            name: true,
            email: true
          }
        }
      },
      take: 5
    })

    return NextResponse.json({
      checksheets,
      templates,
      results
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    )
  }
}
