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
    const checksheetId = searchParams.get('checksheetId')
    const status = searchParams.get('status')

    const results = await prisma.checksheetResult.findMany({
      where: {
        AND: [
          checksheetId ? { checksheetId } : {},
          status ? { status: status as any } : {},
          session.user.role === 'INSPECTOR' ? {
            inspectorId: session.user.id
          } : {},
        ]
      },
      include: {
        checksheet: {
          select: {
            id: true,
            title: true,
            category: true,
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
            checkpoint: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    })

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
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
    const { checksheetId, location, gpsLat, gpsLng, responses } = body

    const result = await prisma.checksheetResult.create({
      data: {
        checksheetId,
        inspectorId: session.user.id,
        location,
        gpsLat,
        gpsLng,
        status: 'IN_PROGRESS',
        responses: {
          create: responses?.map((response: any) => ({
            checkpointId: response.checkpointId,
            value: response.value,
            textValue: response.textValue,
            numberValue: response.numberValue,
            boolValue: response.boolValue,
            dateValue: response.dateValue,
            photoUrls: response.photoUrls || [],
            fileUrls: response.fileUrls || [],
            gpsLat: response.gpsLat,
            gpsLng: response.gpsLng,
            status: response.status || 'PENDING',
            notes: response.notes,
          })) || [],
        },
      },
      include: {
        responses: {
          include: {
            checkpoint: true,
          }
        },
        checksheet: true,
      },
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating result:', error)
    return NextResponse.json(
      { error: 'Failed to create result' },
      { status: 500 }
    )
  }
}
