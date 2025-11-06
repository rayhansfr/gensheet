import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const result = await prisma.checksheetResult.findUnique({
      where: { id },
      include: {
        checksheet: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            organizationId: true,
          }
        },
        inspector: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        responses: {
          include: {
            checkpoint: {
              select: {
                title: true,
                fieldType: true,
                isRequired: true,
              }
            }
          },
          orderBy: {
            checkpoint: {
              order: 'asc'
            }
          }
        },
      },
    })

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Check access
    const hasAccess = 
      session.user.role === 'ADMIN' ||
      result.inspectorId === session.user.id ||
      (session.user.organizationId && session.user.organizationId === result.checksheet.organizationId)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existingResult = await prisma.checksheetResult.findUnique({
      where: { id },
    })

    if (!existingResult) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Check permission
    if (
      session.user.role !== 'ADMIN' &&
      existingResult.inspectorId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const result = await prisma.checksheetResult.update({
      where: { id },
      data: {
        status: body.status,
        notes: body.notes,
        location: body.location,
        completedAt: body.status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        checksheet: true,
        inspector: true,
        responses: {
          include: {
            checkpoint: true,
          }
        },
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating result:', error)
    return NextResponse.json(
      { error: 'Failed to update result' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existingResult = await prisma.checksheetResult.findUnique({
      where: { id },
    })

    if (!existingResult) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    // Only admin or inspector can delete
    if (
      session.user.role !== 'ADMIN' &&
      existingResult.inspectorId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete responses first
    await prisma.checkpointResponse.deleteMany({
      where: { resultId: id }
    })

    // Delete result
    await prisma.checksheetResult.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting result:', error)
    return NextResponse.json(
      { error: 'Failed to delete result' },
      { status: 500 }
    )
  }
}
