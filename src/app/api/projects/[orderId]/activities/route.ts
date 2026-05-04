import { NextRequest, NextResponse } from 'next/server'

// Placeholder for activities
const placeholderActivities = [
  {
    id: '1',
    type: 'task' as const,
    title: 'menyelesaikan tugas',
    description: 'Desain Arsitektur Lantai 1-3 telah selesai',
    user: 'Budi Santoso',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    type: 'document' as const,
    title: 'mengupload dokumen',
    description: 'Floor_Plan_L1_v3.dwg diupload ke folder Arsitek',
    user: 'Budi Santoso',
    timestamp: new Date(Date.now() - 7200000)
  },
  {
    id: '3',
    type: 'message' as const,
    title: 'mengirim pesan',
    description: 'Ada pertanyaan mengenai layout MEP',
    user: 'Ahmad Wijaya',
    timestamp: new Date(Date.now() - 10800000)
  },
  {
    id: '4',
    type: 'task' as const,
    title: 'mengupdate status tugas',
    description: 'Drafting Detail Arsitektur status berubah ke In Review',
    user: 'Dewi Kartika',
    timestamp: new Date(Date.now() - 14400000)
  },
  {
    id: '5',
    type: 'meeting' as const,
    title: 'menjadwalkan meeting',
    description: 'Weekly Progress Meeting dijadwalkan untuk besok',
    user: 'Budi Santoso',
    timestamp: new Date(Date.now() - 28800000)
  },
  {
    id: '6',
    type: 'status' as const,
    title: 'mengupdate progress',
    description: 'Project progress meningkat ke 70%',
    user: 'System',
    timestamp: new Date(Date.now() - 43200000)
  },
  {
    id: '7',
    type: 'task' as const,
    title: 'mengupload deliverable',
    description: '3D_Render_Ext_Final.jpg diupload untuk review',
    user: 'Dewi Kartika',
    timestamp: new Date(Date.now() - 86400000)
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch activities from database
    // For now, return placeholder data
    return NextResponse.json(placeholderActivities)
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}
