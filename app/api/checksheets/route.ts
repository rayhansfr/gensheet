import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const checksheetSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  industry: z.string().optional(),
  isTemplate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  checkpoints: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    fieldType: z.enum([
      'CHECKBOX', 'NUMBER', 'TEXT', 'TEXTAREA', 'PHOTO', 'FILE',
      'DROPDOWN', 'MULTISELECT', 'GPS', 'SIGNATURE', 'DATE', 'TIME',
      'DATETIME', 'RATING'
    ]),
    section: z.string().optional(),
    isRequired: z.boolean().optional(),
    config: z.any().optional(),
  })).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const isTemplate = searchParams.get('isTemplate')

    const checksheets = await prisma.checksheet.findMany({
      where: {
        AND: [
          category ? { category } : {},
          status ? { status: status as any } : {},
          isTemplate === 'true' ? { isTemplate: true } : {},
          session.user.role !== 'ADMIN' ? {
            OR: [
              { creatorId: session.user.id },
              { organizationId: session.user.organizationId },
            ]
          } : {},
        ]
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        checkpoints: {
          orderBy: {
            order: 'asc',
          }
        },
        _count: {
          select: {
            results: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc',
      }
    })

    return NextResponse.json(checksheets)
  } catch (error) {
    console.error('Error fetching checksheets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checksheets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = checksheetSchema.parse(body)

    const { checkpoints, ...checksheetData } = validatedData

    const checksheet = await prisma.checksheet.create({
      data: {
        ...checksheetData,
        creatorId: session.user.id,
        organizationId: session.user.organizationId,
        checkpoints: {
          create: checkpoints?.map((checkpoint, index) => ({
            ...checkpoint,
            order: index,
          })) || [],
        },
      },
      include: {
        checkpoints: {
          orderBy: {
            order: 'asc',
          }
        },
      },
    })

    return NextResponse.json(checksheet, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Error creating checksheet:', error)
    return NextResponse.json(
      { error: 'Failed to create checksheet' },
      { status: 500 }
    )
  }
}
