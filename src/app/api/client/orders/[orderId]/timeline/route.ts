import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { orderId } = await params

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Verify ownership
    const client = await db.client.findUnique({
      where: { userId: session.user.id },
    })

    if (!client || order.clientId !== client.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get project progress
    const progressUpdates = await db.projectProgress.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    })

    // Generate stages based on order status and progress
    const stages = generateStages(order.status, progressUpdates)

    return NextResponse.json({ data: stages })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateStages(orderStatus: string, progressUpdates: any[]) {
  const stageKeys = ['preDesign', 'schematicDesign', 'ded', 'constructionDocs', 'construction', 'completion']

  const statusMap: Record<string, number> = {
    pending: 0,
    in_pre_design: 1,
    in_schematic: 2,
    in_ded: 3,
    in_review: 4,
    completed: 5,
  }

  const currentStageIndex = statusMap[orderStatus] || 0

  const stageNames = {
    preDesign: { en: 'Pre-Design', id: 'Pra-Desain' },
    schematicDesign: { en: 'Schematic Design', id: 'Desain Skematik' },
    ded: { en: 'Design Development (DED)', id: 'Pengembangan Desain (DED)' },
    constructionDocs: { en: 'Construction Documents', id: 'Dokumen Konstruksi' },
    construction: { en: 'Construction', id: 'Konstruksi' },
    completion: { en: 'Completion', id: 'Penyelesaian' },
  }

  const stageDescriptions = {
    preDesign: { en: 'Initial consultation and requirements gathering', id: 'Konsultasi awal dan pengumpulan kebutuhan' },
    schematicDesign: { en: 'Conceptual design and preliminary drawings', id: 'Desain konseptual dan gambar awal' },
    ded: { en: 'Detailed design development', id: 'Pengembangan desain detail' },
    constructionDocs: { en: 'Final construction documents', id: 'Dokumen konstruksi akhir' },
    construction: { en: 'Construction phase', id: 'Fase konstruksi' },
    completion: { en: 'Project completion and handover', id: 'Penyelesaian proyek dan serah terima' },
  }

  return stageKeys.map((key, index) => {
    let status = 'pending'
    let progress = 0
    let startDate, endDate

    if (index < currentStageIndex) {
      status = 'completed'
      progress = 100
    } else if (index === currentStageIndex) {
      status = 'in_progress'
      progress = 50
    }

    // Check if there's a progress update for this stage
    const progressUpdate = progressUpdates.find(p => p.stage === key)
    if (progressUpdate) {
      progress = progressUpdate.percentage
      if (progressUpdate.status === 'completed') {
        status = 'completed'
        progress = 100
      } else if (progressUpdate.status === 'in_progress') {
        status = 'in_progress'
      }
    }

    return {
      id: key,
      name: stageNames[key as keyof typeof stageNames].en,
      nameId: stageNames[key as keyof typeof stageNames].id,
      status,
      progress,
      description: stageDescriptions[key as keyof typeof stageDescriptions].en,
      descriptionId: stageDescriptions[key as keyof typeof stageDescriptions].id,
    }
  })
}
