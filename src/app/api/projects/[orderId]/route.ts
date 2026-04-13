import { NextRequest, NextResponse } from 'next/server'

// Placeholder for project data
const placeholderProject = {
  id: '1',
  orderNumber: 'ORD-2024-001',
  projectName: 'Modern Tropical Villa Project',
  clientName: 'PT. Sejahtera Abadi',
  status: 'in_ded',
  progress: 70,
  startDate: new Date('2024-01-01'),
  estimatedCompletion: new Date('2024-05-15')
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch project data from database
    // For now, return placeholder data
    return NextResponse.json(placeholderProject)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project data' },
      { status: 500 }
    )
  }
}
