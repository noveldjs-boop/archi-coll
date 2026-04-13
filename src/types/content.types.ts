// Content Types: Services, Portfolio, Team, About, etc.

export interface Service {
  id: string
  titleId: string
  titleIndo: string
  titleEng: string
  descId: string
  descIndo: string
  descEng: string
  icon?: string
  imageUrl?: string
  order: number
  active: boolean
  features: ServiceFeature[]
  createdAt: string
  updatedAt: string
}

export interface ServiceFeature {
  id: string
  serviceId: string
  featureId: string
  textIndo: string
  textEng: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface PortfolioProject {
  id: string
  titleIndo: string
  titleEng: string
  descriptionIndo?: string
  descriptionEng?: string
  imageUrl?: string
  category: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AboutContent {
  id: string
  section: 'vision' | 'mission' | 'values'
  contentIndo: string
  contentEng: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  name: string
  titleIndo: string
  titleEng: string
  descriptionIndo?: string
  descriptionEng?: string
  imageUrl?: string
  linkedinUrl?: string
  email?: string
  role: 'founder' | 'co-founder' | 'professional' | 'ceo' | 'cto' | 'marketing' | 'hr' | 'qa' | 'project-director' | 'legal-director' | 'marketing-director' | 'finance-director' | 'it-director' | 'promotion-director' | 'hrd-director' | 'public-relations-director' | 'member'
  order: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface HomeStats {
  id: string
  key: string
  labelIndo: string
  labelEng: string
  value: string
  dataSource: 'static' | 'dynamic'
  icon: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ContactInfo {
  id: string
  type: string
  labelIndo: string
  labelEng: string
  valueIndo: string
  valueEng: string
  icon: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface OperatingHours {
  id: string
  day: string
  labelIndo: string
  labelEng: string
  openTime: string
  closeTime: string
  closed: boolean
  order: number
  createdAt: string
  updatedAt: string
}
