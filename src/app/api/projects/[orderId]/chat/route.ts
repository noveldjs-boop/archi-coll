import { NextRequest, NextResponse } from 'next/server'

// Placeholder for chat messages
const placeholderMessages = [
  {
    id: '1',
    senderId: '1',
    senderName: 'Budi Santoso',
    senderAvatar: '',
    message: 'Halo tim, mari kita diskusikan progress DED hari ini',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
    attachments: []
  },
  {
    id: '2',
    senderId: '2',
    senderName: 'Siti Aminah',
    senderAvatar: '',
    message: 'Siap Pak Budi. Saya sudah selesai dengan perhitungan struktur lantai 1-3',
    timestamp: new Date(Date.now() - 3000000),
    isRead: true,
    attachments: []
  },
  {
    id: '3',
    senderId: 'current-user',
    senderName: 'Anda',
    senderAvatar: '',
    message: 'Bagus! Tolong upload hasilnya ke folder Structure ya',
    timestamp: new Date(Date.now() - 2400000),
    isRead: true,
    attachments: []
  },
  {
    id: '4',
    senderId: '3',
    senderName: 'Ahmad Wijaya',
    senderAvatar: '',
    message: 'Saya sedang working on MEP untuk lantai 1. Ada beberapa pertanyaan mengenai layout',
    timestamp: new Date(Date.now() - 1800000),
    isRead: false,
    attachments: [
      {
        id: 'att1',
        name: 'MEP_Questions_v1.pdf',
        url: '',
        type: 'application/pdf',
        size: 1024000
      }
    ]
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch chat messages from database
    // For now, return placeholder data
    return NextResponse.json(placeholderMessages)
  } catch (error) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
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
    const { message, attachments } = body

    // TODO: Save message to database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
