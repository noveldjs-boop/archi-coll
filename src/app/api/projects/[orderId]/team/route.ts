import { NextRequest, NextResponse } from 'next/server'

// Placeholder for team members data
const placeholderTeam = [
  {
    id: '1',
    name: 'Budi Santoso',
    profession: 'Arsitek',
    avatar: '',
    status: 'online' as const,
    email: 'budi@example.com',
    phone: '+62 812 3456 7890'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    profession: 'Structure',
    avatar: '',
    status: 'online' as const,
    email: 'siti@example.com',
    phone: '+62 812 3456 7891'
  },
  {
    id: '3',
    name: 'Ahmad Wijaya',
    profession: 'MEP',
    avatar: '',
    status: 'offline' as const,
    email: 'ahmad@example.com',
    phone: '+62 812 3456 7892'
  },
  {
    id: '4',
    name: 'Dewi Kartika',
    profession: 'Drafter',
    avatar: '',
    status: 'online' as const,
    email: 'dewi@example.com',
    phone: '+62 812 3456 7893'
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    profession: 'QS',
    avatar: '',
    status: 'offline' as const,
    email: 'eko@example.com',
    phone: '+62 812 3456 7894'
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // TODO: Fetch team members from database
    // For now, return placeholder data
    return NextResponse.json(placeholderTeam)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}
