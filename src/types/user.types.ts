// User Types: User, Member, Client, Admin

export interface User {
  id: string
  email: string
  name?: string
  password?: string
  role: 'admin' | 'user' | 'member'
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  userId: string
  user?: User
  profession: 'architect' | 'structure' | 'mep' | 'drafter' | 'qs' | 'licensed_architect'
  phone: string
  address?: string
  bio?: string
  location?: string
  profileImage?: string
  experience?: number // years
  portfolioUrl?: string
  expertise?: string // Comma-separated
  buildingTypes?: string // For licensed architects
  portfolioImages?: string // JSON array
  portfolioDescription?: string
  linkedinUrl?: string
  portfolioWebsite?: string
  assistantProjects?: string // JSON object
  status: 'pending' | 'active' | 'suspended' | 'rejected'
  approvedAt?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
  certificates?: Certificate[]
  ratingsGiven?: ExpertiseRating[]
  ratingsReceived?: ExpertiseRating[]
  profileProjects?: MemberProject[]
}

export interface Certificate {
  id: string
  memberId: string
  certificateType: string
  certificateNumber?: string
  issuer?: string
  issuedDate?: string
  expiryDate?: string
  documentUrl?: string
  verified: boolean
  verifiedAt?: string
  verifiedBy?: string
  createdAt: string
  updatedAt: string
}

export interface MemberProject {
  id: string
  memberId: string
  title: string
  description?: string
  category: string
  imageUrls: string // JSON array
  location?: string
  year?: number
  order: number
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  userId: string
  phone: string
  address?: string
  profession?: string
  companyName?: string
  status: 'active' | 'suspended' | 'banned'
  createdAt: string
  updatedAt: string
  orders?: Order[]
}

// Order and Project types
export interface Order {
  id: string
  orderNumber: string
  clientId: string
  clientName: string
  clientPhone: string
  clientAddress: string
  clientProfession: string
  clientCompanyName?: string
  landArea: string
  landPosition: string
  landBoundary?: string
  accessRoadWidth?: string
  buildingArea: string
  buildingModel: string
  buildingFloors: string
  structureType: string
  buildingCategory: string
  buildingType?: 'low-rise' | 'mid-rise' | 'high-rise'
  qualityLevel?: 'sederhana' | 'menengah' | 'mewah'
  description?: string
  location?: string
  coordinates?: string
  rab: number
  designFee: number
  iaiFeeRate: number
  pricePerM2: number
  simulatedDP10: number
  dpPaidAmount: number
  agreedDesignFee?: number
  remainingAfterDP: number
  dpPaid: boolean
  dpPaymentDate?: string
  agreedDesignFeeDate?: string
  designAgreed: boolean
  paymentStage: 'pending' | 'dp_paid' | 'design_agreed' | 'payment_80_percent' | 'payment_20_percent' | 'completed'
  payment80PercentPaid: boolean
  payment80Date?: string
  payment20PercentPaid: boolean
  payment20Date?: string
  fullyPaid: boolean
  finalDesignFee?: number
  finalPayment80?: number
  finalPayment20?: number
  status: 'pending' | 'in_pre_design' | 'in_schematic' | 'in_ded' | 'in_review' | 'cancelled' | 'completed'
  assignedMemberId?: string
  assignedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
  payments?: Payment[]
  designDocuments?: DesignDocument[]
}

export interface Payment {
  id: string
  orderId: string
  type: 'dp' | 'payment_80_percent' | 'payment_20_percent'
  amount: number
  paidAt?: string
  paymentMethod?: string
  proofUrl?: string
  verified: boolean
  verifiedAt?: string
  verifiedBy?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface DesignDocument {
  id: string
  orderId: string
  documentType: 'pre_design' | 'schematic' | 'ded' | 'as_build'
  title: string
  description?: string
  fileUrl: string
  deliveredAt?: string
  version: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ConstructionProject {
  id: string
  titleIndo: string
  titleEng: string
  descriptionIndo?: string
  descriptionEng?: string
  imageUrl?: string
  category: string
  requiredProfession: string
  requiredExpertise?: string
  requiredBuildingType?: string
  deadline: string
  budget?: number
  location?: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  leaderId?: string
  status: 'open' | 'leader_assigned' | 'team_assigned' | 'in_progress' | 'review' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt: string
}

export interface ProjectAssignment {
  id: string
  projectId: string
  memberId: string
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'expired'
  role: 'architect' | 'assistant'
  expertiseArea?: string
  assignedAt: string
  acceptedAt?: string
  startedAt?: string
  completedAt?: string
  expiryDate: string
  createdAt: string
  updatedAt: string
}

export interface ExpertiseRating {
  id: string
  projectId: string
  ratedBy: string
  ratedMemberId: string
  expertiseArea: string
  rating: number // 1-5
  feedback?: string
  createdAt: string
}
