'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, User, GraduationCap, Award, Mail, Phone, MapPin, Briefcase, Target, Code, Globe, X, FileText, Linkedin, Loader2, AlertCircle, Users } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

// Types
interface AboutContent {
  id: string
  section: 'vision' | 'mission' | 'values'
  contentIndo: string
  contentEng: string
  order: number
  createdAt: string
  updatedAt: string
}

interface TeamMember {
  id: string
  name: string
  titleIndo: string
  titleEng: string
  descriptionIndo: string | null
  descriptionEng: string | null
  imageUrl: string | null
  linkedinUrl: string | null
  email: string | null
  role: 'founder' | 'co-founder' | 'professional' | 'ceo' | 'cto' | 'marketing' | 'hr' | 'qa' | 'project-director' | 'legal-director' | 'marketing-director' | 'finance-director' | 'it-director' | 'promotion-director' | 'hrd-director' | 'public-relations-director' | 'member'
  order: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export default function AboutPage() {
  const { language, setLanguage, t } = useLanguage()
  
  // Data states
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([
    {
      id: 'vision-default',
      section: 'vision' as const,
      contentIndo: '<p>Menjadi studio arsitektur terdepan yang menciptakan ruang inspiratif dan berkelanjutan di Indonesia.</p>',
      contentEng: '<p>To become a leading architecture studio creating inspiring and sustainable spaces in Indonesia.</p>',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'mission-default',
      section: 'mission' as const,
      contentIndo: '<p>Memberikan layanan desain arsitektur berkualitas tinggi dengan fokus pada inovasi, estetika, dan fungsionalitas.</p>',
      contentEng: '<p>Provide high-quality architectural design services with focus on innovation, aesthetics, and functionality.</p>',
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: 'cmms13b5s0000u8vppu4a7ltn',
      name: 'Djafar Syatri',
      titleIndo: 'Founder of ARCHI-COLL',
      titleEng: 'Founder of ARCHI-COLL',
      descriptionIndo: '18+ Tahun Pengalaman di bidang arsitektur dan konstruksi. Memimpinikkan berbagai proyek besar termasuk Citimall dan Citiplaza.',
      descriptionEng: '18+ Years of experience in architecture and construction. Led various major projects including Citimall and Citiplaza.',
      imageUrl: '/api/images/djafar.jpeg',
      linkedinUrl: null,
      email: 'djafar@archi-coll.com',
      role: 'founder' as const,
      order: 0,
      active: true,
      createdAt: '2026-03-15T17:28:28.480Z',
      updatedAt: '2026-03-15T17:28:28.480Z'
    }
  ])
  
  // Loading and error states
  const [loadingContent, setLoadingContent] = useState(false)
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [errorContent, setErrorContent] = useState<string | null>(null)
  const [errorTeam, setErrorTeam] = useState<string | null>(null)
  const [footerLogoLoaded, setFooterLogoLoaded] = useState(false)

  // Fetch about content
  useEffect(() => {
    let isMounted = true

    const fetchAboutContent = async () => {
      if (!isMounted) return

      try {
        setLoadingContent(true)
        
        const response = await fetch('/api/about-content', {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch about content')
        }
        const data = await response.json()
        console.log('About content loaded:', data)
        if (isMounted && data && data.length > 0) {
          setAboutContent(data)
          setErrorContent(null)
        }
      } catch (err) {
        console.error('Error fetching about content:', err)
        // Keep default content if error
        if (isMounted) {
          setErrorContent(null)
        }
      } finally {
        if (isMounted) {
          setLoadingContent(false)
        }
      }
    }

    fetchAboutContent()

    return () => {
      isMounted = false
    }
  }, [])

  // Fetch team members
  useEffect(() => {
    let isMounted = true

    const fetchTeamMembers = async () => {
      if (!isMounted) return

      try {
        setLoadingTeam(true)
        
        const response = await fetch('/api/team-members', {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch team members')
        }
        const data = await response.json()
        console.log('Team members loaded:', data)
        if (isMounted && data && data.length > 0) {
          setTeamMembers(data.filter((item: TeamMember) => item.active))
          setErrorTeam(null)
        }
      } catch (err) {
        console.error('Error fetching team members:', err)
        // Keep default team member if error
        if (isMounted) {
          setErrorTeam(null)
        }
      } finally {
        if (isMounted) {
          setLoadingTeam(false)
        }
      }
    }

    fetchTeamMembers()

    return () => {
      isMounted = false
    }
  }, [])

  // Get content based on language
  const getContent = (item: AboutContent) => {
    return language === 'id' ? item.contentIndo : item.contentEng
  }

  // Get title based on language
  const getTitle = (member: TeamMember) => {
    return language === 'id' ? member.titleIndo : member.titleEng
  }

  // Get description based on language
  const getDescription = (member: TeamMember) => {
    return language === 'id' ? member.descriptionIndo : member.descriptionEng
  }

  // Get badge color based on role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'bg-[#E74C3C] text-white'
      case 'co-founder':
        return 'bg-[#F39C12] text-white'
      case 'ceo':
        return 'bg-[#9B59B6] text-white'
      case 'cto':
        return 'bg-[#3498DB] text-white'
      case 'marketing':
        return 'bg-[#27AE60] text-white'
      case 'hr':
        return 'bg-[#E67E22] text-white'
      case 'qa':
        return 'bg-[#F39C12] text-white'
      case 'project-director':
        return 'bg-[#6B5B95] text-white'
      case 'legal-director':
        return 'bg-[#34495E] text-white'
      case 'marketing-director':
        return 'bg-[#16A085] text-white'
      case 'finance-director':
        return 'bg-[#2ECC71] text-white'
      case 'it-director':
        return 'bg-[#3498DB] text-white'
      case 'promotion-director':
        return 'bg-[#E67E22] text-white'
      case 'hrd-director':
        return 'bg-[#D35400] text-white'
      case 'public-relations-director':
        return 'bg-[#9B59B6] text-white'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  // Get role label based on language
  const getRoleLabel = (role: string) => {
    const labels: Record<string, { id: string; en: string }> = {
      'founder': { id: 'Founder', en: 'Founder' },
      'co-founder': { id: 'Co-Founder', en: 'Co-Founder' },
      'professional': { id: 'Tenaga Ahli', en: 'Professional' },
      'ceo': { id: 'CEO', en: 'CEO' },
      'cto': { id: 'CTO', en: 'CTO' },
      'marketing': { id: 'Marketing', en: 'Marketing' },
      'hr': { id: 'HR', en: 'HR' },
      'qa': { id: 'QA', en: 'QA' },
      'project-director': { id: 'Direktur Project', en: 'Project Director' },
      'legal-director': { id: 'Direktur Legal', en: 'Legal Director' },
      'marketing-director': { id: 'Direktur Marketing', en: 'Marketing Director' },
      'finance-director': { id: 'Direktur Keuangan', en: 'Finance Director' },
      'it-director': { id: 'Direktur IT', en: 'IT Director' },
      'promotion-director': { id: 'Direktur Promosi', en: 'Promotion Director' },
      'hrd-director': { id: 'Direktur HRD', en: 'HRD Director' },
      'public-relations-director': { id: 'Direktur HUMAS', en: 'Public Relations Director' }
    }
    return labels[role]?.[language] || role
  }

  // Get section title based on language
  const getSectionTitle = (section: string) => {
    const titles: Record<string, { id: string; en: string }> = {
      'vision': { id: 'Visi', en: 'Vision' },
      'mission': { id: 'Misi', en: 'Mission' },
      'values': { id: 'Nilai Utama', en: 'Core Values' }
    }
    return titles[section]?.[language] || section
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
      {/* Content Layer */}
      <div className="relative z-10 h-screen flex flex-col">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <section className="pt-24 pb-12 flex-shrink-0">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <Badge className="mb-4 bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] text-white border-0">Profile</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">
              {t('about.pageTitle')}
            </span>
            <span className="bg-gradient-to-r from-[#E74C3C] via-[#F39C12] to-[#F1C40F] bg-clip-text text-transparent"> ARCHI-COLL</span>
          </h1>
        </div>
      </section>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* About Content */}
        <section className="py-12 pb-24">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="space-y-12">

            {/* Vision & Mission Section - Dynamic */}
            <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
              <CardContent className="pt-8">
                <h3 className="text-3xl font-bold text-white mb-6">
                  <span className="bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent">
                    {language === 'id' ? 'Visi & Misi ARCHI-COLL' : 'Vision & Mission ARCHI-COLL'}
                  </span>
                </h3>

                {/* Render Vision */}
                {aboutContent
                  .filter(item => item.section === 'vision')
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div key={item.id} className="mb-6">
                      <h4 className="font-semibold text-white mb-3 text-[#9B59B6] text-lg flex items-center gap-2">
                        <Target className="w-6 h-6" />
                        {getSectionTitle(item.section)}
                      </h4>
                      <div 
                        className="text-gray-300 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: getContent(item) }}
                      />
                    </div>
                  ))
                }

                {/* Render Mission */}
                {aboutContent
                  .filter(item => item.section === 'mission')
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <div key={item.id} className="mb-6">
                      <h4 className="font-semibold text-white mb-3 text-[#E74C3C] text-lg flex items-center gap-2">
                        <Award className="w-6 h-6" />
                        {getSectionTitle(item.section)}
                      </h4>
                      <div 
                        className="text-gray-300 leading-relaxed text-lg"
                        dangerouslySetInnerHTML={{ __html: getContent(item) }}
                      />
                    </div>
                  ))
                }

                {/* Render Values */}
                {aboutContent
                  .filter(item => item.section === 'values')
                  .sort((a, b) => a.order - b.order)
                  .length > 0 && (
                    <div>
                      <h5 className="font-semibold text-white mb-4 flex items-center gap-2 text-lg">
                        <Code className="w-6 h-6 text-[#9B59B6]" />
                        {getSectionTitle('values')}
                      </h5>
                      <div className="space-y-4">
                        {aboutContent
                          .filter(item => item.section === 'values')
                          .sort((a, b) => a.order - b.order)
                          .map((item, index) => {
                            const colors = ['#E74C3C', '#9B59B6', '#F39C12', '#6B5B95', '#3498DB', '#1ABC9C']
                            const bgColors = ['#E74C3C', '#9B59B6', '#F39C12', '#6B5B95', '#3498DB', '#1ABC9C']
                            const colorIndex = index % colors.length
                            return (
                              <div key={item.id} className="flex items-start gap-4 p-4 bg-[#1E1E1E]/50 rounded-xl">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                  style={{ backgroundColor: `${bgColors[colorIndex]}20` }}
                                >
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: colors[colorIndex] }}
                                  ></div>
                                </div>
                                <div className="flex-1">
                                  <div 
                                    className="text-gray-300 leading-relaxed text-lg"
                                    dangerouslySetInnerHTML={{ __html: getContent(item) }}
                                  />
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            {/* Team Members Section */}
            <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border border-gray-700">
              <CardContent className="pt-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-[#E74C3C]" />
                  <span className="bg-gradient-to-r from-[#E74C3C] via-[#F39C12] to-[#F1C40F] bg-clip-text text-transparent">
                    {language === 'id' ? 'Tim Kami' : 'Our Team'}
                  </span>
                </h3>

                {loadingTeam ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-8 h-8 text-[#9B59B6] animate-spin" />
                      <p className="text-gray-400">{language === 'id' ? 'Memuat tim...' : 'Loading team...'}</p>
                    </div>
                  </div>
                ) : errorTeam ? (
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{errorTeam}</span>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">
                    {language === 'id' ? 'Belum ada anggota tim yang ditampilkan.' : 'No team members to display yet.'}
                  </p>
                ) : (
                  <>
                    {/* Founders Section - Displayed prominently */}
                    {teamMembers
                      .filter(m => ['founder', 'co-founder', 'ceo', 'cto', 'marketing', 'hr', 'qa', 'project-director', 'legal-director', 'marketing-director', 'finance-director', 'it-director', 'promotion-director', 'hrd-director', 'public-relations-director'].includes(m.role))
                      .sort((a, b) => a.order - b.order)
                      .length > 0 && (
                        <div className="mb-12">
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#F39C12]" />
                            {language === 'id' ? 'Founder & Leadership' : 'Founder & Leadership'}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            {teamMembers
                              .filter(m => ['founder', 'co-founder', 'ceo', 'cto', 'marketing', 'hr', 'qa', 'project-director', 'legal-director', 'marketing-director', 'finance-director', 'it-director', 'promotion-director', 'hrd-director', 'public-relations-director'].includes(m.role))
                              .sort((a, b) => a.order - b.order)
                              .map((member) => (
                                <Card 
                                  key={member.id} 
                                  className="bg-gradient-to-br from-[#6B5B95]/20 to-[#E74C3C]/20 border-2 border-[#9B59B6] hover:border-[#E74C3C] transition-all duration-300"
                                >
                                  <CardContent className="pt-8">
                                    <div className="flex flex-col items-center text-center">
                                      {/* Profile Photo */}
                                      {member.imageUrl ? (
                                        <img
                                          src={member.imageUrl}
                                          alt={member.name}
                                          className="w-40 h-40 object-cover rounded-full mb-4 border-3 border-[#9B59B6] shadow-2xl"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                            const nextEl = e.currentTarget.nextElementSibling as HTMLElement
                                            if (nextEl) nextEl.style.display = 'flex'
                                          }}
                                        />
                                      ) : null}
                                      <div 
                                        className="w-40 h-40 rounded-full mb-4 border-3 border-[#9B59B6] flex items-center justify-center"
                                        style={{ display: member.imageUrl ? 'none' : 'flex', background: 'linear-gradient(135deg, rgba(107,91,149,0.4), rgba(231,76,60,0.4))' }}
                                      >
                                        <User className="w-20 h-20 text-white" />
                                      </div>

                                      {/* Name and Title */}
                                      <h4 className="text-2xl font-bold text-white mb-2">{member.name}</h4>
                                      <p className="text-[#E74C3C] font-bold text-lg mb-3">{getTitle(member)}</p>
                                      
                                      {/* Role Badge */}
                                      <Badge className={`${getRoleBadgeColor(member.role)} mb-3 px-4 py-1 text-base`}>
                                        {getRoleLabel(member.role)}
                                      </Badge>

                                      {/* Description */}
                                      {getDescription(member) && (
                                        <p className="text-gray-300 text-base leading-relaxed mb-4">
                                          {getDescription(member)}
                                        </p>
                                      )}

                                      {/* LinkedIn Link */}
                                      {member.linkedinUrl && (
                                        <a
                                          href={member.linkedinUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-[#0077B5] hover:text-[#00A0DC] transition-colors"
                                        >
                                          <Linkedin className="w-5 h-5" />
                                          <span className="text-base font-medium">LinkedIn</span>
                                        </a>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>
                      )}

                    {/* Other Team Members Section - Tenaga Ahli */}
                    {teamMembers
                      .filter(m => m.role === 'professional' || m.role === 'member')
                      .sort((a, b) => a.order - b.order)
                      .length > 0 && (
                        <div>
                          <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-[#6B5B95]" />
                            {language === 'id' ? 'Tenaga Ahli' : 'Professional Team'}
                          </h4>
                          <p className="text-gray-400 mb-6 text-sm">
                            {language === 'id'
                              ? 'Tenaga ahli perusahaan yang akan mereview dan mendampingi pendaftar baru melalui proses seleksi.'
                              : 'Company experts who will review and guide new applicants through the selection process.'}
                          </p>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {teamMembers
                              .filter(m => m.role === 'professional' || m.role === 'member')
                              .sort((a, b) => a.order - b.order)
                              .map((member) => (
                                <Card 
                                  key={member.id} 
                                  className="bg-gradient-to-br from-[#6B5B95]/10 to-[#E74C3C]/10 border border-gray-700 hover:border-[#9B59B6] transition-all duration-300"
                                >
                                  <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center">
                                      {/* Profile Photo */}
                                      {member.imageUrl ? (
                                        <img
                                          src={member.imageUrl}
                                          alt={member.name}
                                          className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-[#9B59B6]"
                                          onError={(e) => {
                                            e.currentTarget.style.display = 'none'
                                            const nextEl = e.currentTarget.nextElementSibling as HTMLElement
                                            if (nextEl) nextEl.style.display = 'flex'
                                          }}
                                        />
                                      ) : null}
                                      <div 
                                        className="w-32 h-32 rounded-full mb-4 border-2 border-[#9B59B6] flex items-center justify-center"
                                        style={{ display: member.imageUrl ? 'none' : 'flex', background: 'linear-gradient(135deg, rgba(107,91,149,0.3), rgba(231,76,60,0.3))' }}
                                      >
                                        <User className="w-16 h-16 text-white" />
                                      </div>

                                      {/* Name and Title */}
                                      <h4 className="text-xl font-bold text-white mb-1">{member.name}</h4>
                                      <p className="text-[#E74C3C] font-medium mb-3">{getTitle(member)}</p>
                                      
                                      {/* Role Badge */}
                                      <Badge className={`${getRoleBadgeColor(member.role)} mb-3`}>
                                        {getRoleLabel(member.role)}
                                      </Badge>

                                      {/* Description */}
                                      {getDescription(member) && (
                                        <p className="text-gray-300 text-base leading-relaxed mb-4">
                                          {getDescription(member)}
                                        </p>
                                      )}

                                      {/* LinkedIn Link */}
                                      {member.linkedinUrl && (
                                        <a
                                          href={member.linkedinUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 text-[#0077B5] hover:text-[#00A0DC] transition-colors"
                                        >
                                          <Linkedin className="w-5 h-5" />
                                          <span className="text-sm font-medium">LinkedIn</span>
                                        </a>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </section>
      </div>

      {/* Footer - Fixed at bottom */}
      <footer className="flex-shrink-0 bg-[#1E1E1E] py-4 border-t border-gray-700">
        <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              {!footerLogoLoaded && (
                <div className="w-8 h-8 bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <Image
                src="/logo-archi-coll.png"
                alt="ARCHI-COLL Logo"
                width={32}
                height={32}
                className={`object-contain transition-opacity duration-300 ${footerLogoLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoad={() => setFooterLogoLoaded(true)}
                priority
                sizes="32px"
              />
              <span className="font-semibold bg-gradient-to-r from-[#6B5B95] via-[#9B59B6] to-[#E74C3C] bg-clip-text text-transparent text-sm sm:text-base">ARCHI-COLL</span>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} ARCHI-COLL. {t('footer.allRights')}
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  )
}
