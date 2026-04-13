import { NextRequest, NextResponse } from 'next/server'

// Placeholder for documents
const placeholderDocuments = [
  {
    id: '1',
    name: 'Site_Survey_Final.pdf',
    folder: 'Arsitek',
    url: '',
    type: 'application/pdf',
    size: 5242880,
    uploadedBy: 'Budi Santoso',
    uploadedAt: new Date('2024-01-05'),
    version: 1
  },
  {
    id: '2',
    name: 'Floor_Plan_L1_v3.dwg',
    folder: 'Arsitek',
    url: '',
    type: 'application/dwg',
    size: 10485760,
    uploadedBy: 'Budi Santoso',
    uploadedAt: new Date('2024-02-15'),
    version: 3
  },
  {
    id: '3',
    name: 'Structure_Calc_L1-L3.xlsx',
    folder: 'Structure',
    url: '',
    type: 'application/vnd.ms-excel',
    size: 2097152,
    uploadedBy: 'Siti Aminah',
    uploadedAt: new Date('2024-02-20'),
    version: 2
  },
  {
    id: '4',
    name: 'MEP_Schematic_L1.dwg',
    folder: 'MEP',
    url: '',
    type: 'application/dwg',
    size: 8388608,
    uploadedBy: 'Ahmad Wijaya',
    uploadedAt: new Date('2024-02-25'),
    version: 1
  },
  {
    id: '5',
    name: '3D_Render_Ext_Final.jpg',
    folder: 'Drafter',
    url: '',
    type: 'image/jpeg',
    size: 15728640,
    uploadedBy: 'Dewi Kartika',
    uploadedAt: new Date('2024-02-25'),
    version: 1
  },
  {
    id: '6',
    name: 'RAB_Preliminary_v1.xlsx',
    folder: 'QS',
    url: '',
    type: 'application/vnd.ms-excel',
    size: 3145728,
    uploadedBy: 'Eko Prasetyo',
    uploadedAt: new Date('2024-02-28'),
    version: 1
  },
  {
    id: '7',
    name: 'Elevation_Front.jpg',
    folder: 'Arsitek',
    url: '',
    type: 'image/jpeg',
    size: 10485760,
    uploadedBy: 'Budi Santoso',
    uploadedAt: new Date('2024-02-10'),
    version: 2
  },
  {
    id: '8',
    name: 'Section_AA.dwg',
    folder: 'Structure',
    url: '',
    type: 'application/dwg',
    size: 5242880,
    uploadedBy: 'Siti Aminah',
    uploadedAt: new Date('2024-02-18'),
    version: 1
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch documents from database
    // For now, return placeholder data
    return NextResponse.json(placeholderDocuments)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
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

    // TODO: Upload document to storage and save to database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully'
    })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
