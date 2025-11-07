import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get the template
    const template = await prisma.bestPracticeTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Parse template data
    const templateData = template.templateData as any

    // Create a new checksheet from the template
    const checksheet = await prisma.checksheet.create({
      data: {
        title: `${template.title} (Copy)`,
        description: template.description || '',
        category: template.category,
        status: 'DRAFT',
        creatorId: session.user.id,
        organizationId: session.user.organizationId,
        checkpoints: {
          create: (templateData.checkpoints || []).map((cp: any, index: number) => ({
            title: cp.title || cp.question || '',
            description: cp.description || '',
            order: index,
            fieldType: cp.fieldType || cp.type || 'TEXT',
            isRequired: cp.isRequired ?? cp.required ?? false,
            section: cp.section || 'General',
            config: cp.config || {}
          }))
        }
      },
      include: {
        checkpoints: true
      }
    })

    // Increment template usage count
    await prisma.bestPracticeTemplate.update({
      where: { id },
      data: { usageCount: { increment: 1 } }
    })

    return NextResponse.json(checksheet)
  } catch (error) {
    console.error('Error cloning template:', error)
    return NextResponse.json(
      { error: 'Failed to clone template' },
      { status: 500 }
    )
  }
}
