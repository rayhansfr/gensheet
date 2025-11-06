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
    console.log('Fetching checksheet with ID:', id)
    console.log('User:', session.user.email, 'Role:', session.user.role)

    const checksheet = await prisma.checksheet.findUnique({
      where: { id },
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
        results: {
          include: {
            inspector: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            responses: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            results: true,
            assignments: true,
          }
        }
      },
    })

    if (!checksheet) {
      console.log('Checksheet not found in database:', id)
      return NextResponse.json({ error: 'Checksheet not found' }, { status: 404 })
    }

    console.log('Checksheet found:', checksheet.title)
    console.log('Checksheet creator:', checksheet.creatorId)
    console.log('Checksheet organization:', checksheet.organizationId)

    // Check access
    const hasAccess = 
      session.user.role === 'ADMIN' ||
      checksheet.creatorId === session.user.id ||
      (checksheet.organizationId && checksheet.organizationId === session.user.organizationId)

    console.log('Access check - hasAccess:', hasAccess)

    if (!hasAccess) {
      console.log('Access denied for user:', session.user.email)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(checksheet)
  } catch (error) {
    console.error('Error fetching checksheet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch checksheet' },
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

    const body = await request.json()
    const { id } = await params

    const existingChecksheet = await prisma.checksheet.findUnique({
      where: { id },
    })

    if (!existingChecksheet) {
      return NextResponse.json({ error: 'Checksheet not found' }, { status: 404 })
    }

    // Check permission
    if (
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'SUPERVISOR' &&
      existingChecksheet.creatorId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { checkpoints, ...updateData } = body

    const checksheet = await prisma.checksheet.update({
      where: { id },
      data: {
        ...updateData,
        checkpoints: checkpoints ? {
          deleteMany: {},
          create: checkpoints.map((checkpoint: any, index: number) => ({
            ...checkpoint,
            order: index,
          })),
        } : undefined,
      },
      include: {
        checkpoints: {
          orderBy: {
            order: 'asc',
          }
        },
      },
    })

    return NextResponse.json(checksheet)
  } catch (error) {
    console.error('Error updating checksheet:', error)
    return NextResponse.json(
      { error: 'Failed to update checksheet' },
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

    const existingChecksheet = await prisma.checksheet.findUnique({
      where: { id },
    })

    if (!existingChecksheet) {
      return NextResponse.json({ error: 'Checksheet not found' }, { status: 404 })
    }

    // Only creator or admin can delete
    if (
      session.user.role !== 'ADMIN' &&
      existingChecksheet.creatorId !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.checksheet.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting checksheet:', error)
    return NextResponse.json(
      { error: 'Failed to delete checksheet' },
      { status: 500 }
    )
  }
}
