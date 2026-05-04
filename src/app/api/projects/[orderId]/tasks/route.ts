import { NextRequest, NextResponse } from 'next/server'

// Placeholder for tasks
const placeholderTasks = [
  {
    id: '1',
    title: 'Desain Arsitektur Lantai 1-3',
    description: 'Complete architectural design for floors 1-3 including layout, elevation, and section',
    profession: 'Arsitek',
    status: 'completed' as const,
    assigneeId: '1',
    assigneeName: 'Budi Santoso',
    dueDate: new Date('2024-02-15'),
    createdAt: new Date('2024-01-01'),
    deliverables: [
      {
        id: 'del1',
        name: 'Floor_Plan_L1-L3_v2.dwg',
        url: '',
        version: 2,
        uploadedAt: new Date('2024-02-10'),
        uploadedBy: 'Budi Santoso',
        status: 'approved' as const,
        feedback: ''
      }
    ]
  },
  {
    id: '2',
    title: 'Perhitungan Struktur Lantai 1-3',
    description: 'Structural calculations and detailing for floors 1-3',
    profession: 'Structure',
    status: 'in_progress' as const,
    assigneeId: '2',
    assigneeName: 'Siti Aminah',
    dueDate: new Date('2024-02-28'),
    createdAt: new Date('2024-01-15'),
    deliverables: []
  },
  {
    id: '3',
    title: 'Desain MEP Lantai 1',
    description: 'MEP design for floor 1 including electrical, plumbing, and HVAC',
    profession: 'MEP',
    status: 'in_progress' as const,
    assigneeId: '3',
    assigneeName: 'Ahmad Wijaya',
    dueDate: new Date('2024-03-15'),
    createdAt: new Date('2024-02-01'),
    deliverables: []
  },
  {
    id: '4',
    title: 'Drafting Detail Arsitektur',
    description: 'Create detailed architectural drawings and 3D renderings',
    profession: 'Drafter',
    status: 'review' as const,
    assigneeId: '4',
    assigneeName: 'Dewi Kartika',
    dueDate: new Date('2024-03-01'),
    createdAt: new Date('2024-02-10'),
    deliverables: [
      {
        id: 'del2',
        name: '3D_Render_Ext_Final.jpg',
        url: '',
        version: 1,
        uploadedAt: new Date('2024-02-25'),
        uploadedBy: 'Dewi Kartika',
        status: 'pending_review' as const,
        feedback: ''
      }
    ]
  },
  {
    id: '5',
    title: 'Quantity Take-off & RAB',
    description: 'Calculate quantities and prepare RAB for the project',
    profession: 'QS',
    status: 'pending' as const,
    assigneeId: '5',
    assigneeName: 'Eko Prasetyo',
    dueDate: new Date('2024-04-01'),
    createdAt: new Date('2024-02-20'),
    deliverables: []
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch tasks from database
    // For now, return placeholder data
    return NextResponse.json(placeholderTasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const body = await request.json()

    // TODO: Create new task in database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Task created successfully'
    })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
