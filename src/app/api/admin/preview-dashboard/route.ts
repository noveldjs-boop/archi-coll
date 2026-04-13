import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Sample data for each profession type
const getSampleData = (profession: string) => {
  const baseProjects = [
    {
      id: '1',
      project: {
        id: 'proj-1',
        titleIndo: 'Rumah Tinggal Pak Hary',
        titleEng: 'Pak Hary Residential House',
        descriptionIndo: 'Desain hunian modern dengan konsep minimalis tropis',
        descriptionEng: 'Modern residential design with tropical minimalist concept',
        deadline: '2025-02-15',
        status: 'in_progress',
        priority: 'high',
        requiredProfession: profession,
        imageUrl: '/api/images/rumah pak hary AI.jpg'
      },
      status: 'in_progress',
      expiryDate: '2025-03-15'
    },
    {
      id: '2',
      project: {
        id: 'proj-2',
        titleIndo: 'Lapangan Golf Aerial View',
        titleEng: 'Golf Course Aerial View',
        descriptionIndo: 'Masterplan lapangan golf dengan fasilitas lengkap',
        descriptionEng: 'Golf course masterplan with complete facilities',
        deadline: '2025-03-01',
        status: 'accepted',
        priority: 'medium',
        requiredProfession: profession,
        imageUrl: '/api/images/lapangan golf aerial.jpeg'
      },
      status: 'accepted',
      expiryDate: '2025-04-01'
    },
    {
      id: '3',
      project: {
        id: 'proj-3',
        titleIndo: 'Apartement Mewah Jakarta Selatan',
        titleEng: 'Luxury Apartment South Jakarta',
        descriptionIndo: 'Apartemen premium dengan fasilitas 5 bintang',
        descriptionEng: 'Premium apartment with 5-star facilities',
        deadline: '2025-04-20',
        status: 'completed',
        priority: 'high',
        requiredProfession: profession,
        imageUrl: null
      },
      status: 'completed',
      expiryDate: '2025-05-20'
    }
  ]

  const professionSpecificProjects = {
    'architect': [
      {
        id: '4',
        project: {
          id: 'proj-4',
          titleIndo: 'Villa Bali Modern',
          titleEng: 'Modern Bali Villa',
          descriptionIndo: 'Villa kontemporer dengan sentuhan budaya Bali',
          descriptionEng: 'Contemporary villa with Balinese cultural touches',
          deadline: '2025-05-10',
          status: 'open',
          priority: 'high',
          requiredProfession: 'architect',
          imageUrl: null
        },
        status: 'open',
        expiryDate: '2025-06-10'
      }
    ],
    'structure': [
      {
        id: '4',
        project: {
          id: 'proj-5',
          titleIndo: 'Gedung Bertingkat 10 Lantai',
          titleEng: '10-Story Building',
          descriptionIndo: 'Struktur beton bertulang untuk gedung perkantoran',
          descriptionEng: 'Reinforced concrete structure for office building',
          deadline: '2025-04-30',
          status: 'in_progress',
          priority: 'urgent',
          requiredProfession: 'structure',
          imageUrl: null
        },
        status: 'in_progress',
        expiryDate: '2025-05-30'
      }
    ],
    'mep': [
      {
        id: '4',
        project: {
          id: 'proj-6',
          titleIndo: 'Sistem HVAC Shopping Mall',
          titleEng: 'Shopping Mall HVAC System',
          descriptionIndo: 'Desain sistem pendingin dan ventilasi mall',
          descriptionEng: 'Mall air conditioning and ventilation system design',
          deadline: '2025-03-15',
          status: 'accepted',
          priority: 'high',
          requiredProfession: 'mep',
          imageUrl: null
        },
        status: 'accepted',
        expiryDate: '2025-04-15'
      }
    ],
    'drafter': [
      {
        id: '4',
        project: {
          id: 'proj-7',
          titleIndo: 'Detail Drawing Villa',
          titleEng: 'Villa Detail Drawing',
          descriptionIndo: 'Gambar kerja detail untuk villa mewah',
          descriptionEng: 'Detail working drawings for luxury villa',
          deadline: '2025-02-28',
          status: 'in_progress',
          priority: 'medium',
          requiredProfession: 'drafter',
          imageUrl: null
        },
        status: 'in_progress',
        expiryDate: '2025-03-28'
      }
    ],
    'qs': [
      {
        id: '4',
        project: {
          id: 'proj-8',
          titleIndo: 'RAB Hotel Bintang 5',
          titleEng: '5-Star Hotel BOQ',
          descriptionIndo: 'Perhitungan quantity dan biaya konstruksi hotel',
          descriptionEng: 'Construction quantity and cost calculation for hotel',
          deadline: '2025-03-20',
          status: 'in_progress',
          priority: 'high',
          requiredProfession: 'qs',
          imageUrl: null
        },
        status: 'in_progress',
        expiryDate: '2025-04-20'
      }
    ],
    'licensed_architect': [
      {
        id: '4',
        project: {
          id: 'proj-9',
          titleIndo: 'Pusat Perbelanjaan Modern',
          titleEng: 'Modern Shopping Center',
          descriptionIndo: 'Desain pusat perbelanjaan dengan konsep urban',
          descriptionEng: 'Urban concept shopping center design',
          deadline: '2025-06-15',
          status: 'open',
          priority: 'urgent',
          requiredProfession: 'licensed_architect',
          imageUrl: null
        },
        status: 'open',
        expiryDate: '2025-07-15'
      }
    ]
  }

  return [
    ...baseProjects,
    ...professionSpecificProjects[profession as keyof typeof professionSpecificProjects] || []
  ]
}

const getInboxSampleData = (profession: string) => {
  return [
    {
      id: '1',
      type: 'project',
      title: 'Proyek Baru Ditugaskan',
      content: 'Anda telah ditugaskan untuk proyek Rumah Tinggal Pak Hary. Mohon segera review dan terima tugas.',
      link: '/member/dashboard',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 min ago
    },
    {
      id: '2',
      type: 'message',
      title: 'Pesan dari Tim',
      content: 'Tim MEP telah mengunggah revisi untuk proyek Lapangan Golf. Silakan review.',
      link: null,
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() // 2 hours ago
    },
    {
      id: '3',
      type: 'system',
      title: 'Deadline Mendekat',
      content: 'Proyek Rumah Tinggal Pak Hary akan jatuh tempo dalam 3 hari. Pastikan upload revisi tepat waktu.',
      link: '/member/dashboard',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString() // 4 hours ago
    }
  ]
}

const getRevisionsSampleData = (projectId: string) => {
  return [
    {
      id: '1',
      revisionNumber: 1,
      title: 'Revisi Awal - Denah Lantai 1',
      description: 'Perubahan layout ruang tamu dan dapur sesuai feedback klien',
      documentUrl: '/api/images/sample-revision-1.pdf',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
      id: '2',
      revisionNumber: 2,
      title: 'Revisi - Fasade Depan',
      description: 'Update desain fasade sesuai permintaan arsitek utama',
      documentUrl: '/api/images/sample-revision-2.pdf',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
    }
  ]
}

const getChatSampleData = (projectId: string, profession: string) => {
  return [
    {
      id: '1',
      memberId: 'user-1',
      memberName: 'Tim Arsitek Utama',
      message: 'Mohon review desain denah lantai 1, apakah sudah sesuai dengan requirement?',
      attachmentUrl: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      id: '2',
      memberId: 'user-2',
      memberName: profession === 'drafter' ? 'Drafter' : profession === 'qs' ? 'QS' : 'Designer',
      message: 'Sudah saya review dan sesuai. Saya akan segera upload revisi detail.',
      attachmentUrl: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      id: '3',
      memberId: 'user-1',
      memberName: 'Tim Arsitek Utama',
      message: 'Terima kasih. Deadline adalah tanggal 15 Februari, mohon diperhatikan.',
      attachmentUrl: '/api/images/instruction.pdf',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    }
  ]
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const profession = searchParams.get('profession')
    const projectId = searchParams.get('projectId')

    if (!profession) {
      return NextResponse.json(
        { error: "Profession parameter is required" },
        { status: 400 }
      )
    }

    const validProfessions = ['architect', 'structure', 'mep', 'drafter', 'qs', 'licensed_architect']
    if (!validProfessions.includes(profession)) {
      return NextResponse.json(
        { error: "Invalid profession" },
        { status: 400 }
      )
    }

    const dataType = searchParams.get('data') || 'all'

    const response: any = {
      profession,
      professionLabel: {
        'architect': 'Desain Arsitek',
        'structure': 'Desain Struktur',
        'mep': 'Desain MEP',
        'drafter': 'Drafter',
        'qs': 'QS (Quantity Surveyor)',
        'licensed_architect': 'Arsitek Berlisensi'
      }[profession as keyof typeof validProfessions],
      member: {
        id: 'preview-user',
        name: 'Preview User',
        email: `preview-${profession}@archi-coll.com`,
        profession: profession,
        experience: 5,
        status: 'active'
      }
    }

    if (dataType === 'all' || dataType === 'assignments') {
      response.assignments = getSampleData(profession)
    }

    if (dataType === 'all' || dataType === 'inbox') {
      response.inbox = getInboxSampleData(profession)
    }

    if (projectId && (dataType === 'all' || dataType === 'revisions')) {
      response.revisions = getRevisionsSampleData(projectId)
    }

    if (projectId && (dataType === 'all' || dataType === 'chat')) {
      response.chat = getChatSampleData(projectId, profession)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching preview data:", error)
    return NextResponse.json(
      { error: "Failed to fetch preview data" },
      { status: 500 }
    )
  }
}
