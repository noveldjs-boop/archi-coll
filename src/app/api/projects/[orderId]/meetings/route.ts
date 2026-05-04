import { NextRequest, NextResponse } from 'next/server'

// Placeholder for meetings
const placeholderMeetings = [
  {
    id: '1',
    title: 'Weekly Progress Meeting',
    date: new Date(Date.now() + 86400000), // Tomorrow
    duration: 60,
    participants: ['Budi Santoso', 'Siti Aminah', 'Ahmad Wijaya', 'Dewi Kartika'],
    agenda: 'Review progress DED and discuss next steps',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    recordingUrl: null,
    status: 'upcoming' as const
  },
  {
    id: '2',
    title: 'Design Review Meeting',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    duration: 90,
    participants: ['Budi Santoso', 'Siti Aminah'],
    agenda: 'Review structural design and architectural integration',
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
    recordingUrl: null,
    status: 'upcoming' as const
  },
  {
    id: '3',
    title: 'Kick-off Meeting',
    date: new Date(Date.now() - 604800000), // 1 week ago
    duration: 120,
    participants: ['Budi Santoso', 'Siti Aminah', 'Ahmad Wijaya', 'Dewi Kartika', 'Eko Prasetyo'],
    agenda: 'Project introduction and team introduction',
    meetingLink: null,
    recordingUrl: 'https://storage.example.com/recordings/kickoff.mp4',
    status: 'completed' as const
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch meetings from database
    // For now, return placeholder data
    return NextResponse.json(placeholderMeetings)
  } catch (error) {
    console.error('Error fetching meetings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meetings' },
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

    // TODO: Create new meeting in database
    // For now, return success
    return NextResponse.json({
      success: true,
      message: 'Meeting scheduled successfully'
    })
  } catch (error) {
    console.error('Error scheduling meeting:', error)
    return NextResponse.json(
      { error: 'Failed to schedule meeting' },
      { status: 500 }
    )
  }
}
