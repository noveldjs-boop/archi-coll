'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Phone, Mail, MapPin, Send, Users, Briefcase, Handshake, User, Linkedin, Loader2, CheckCircle, FileText, Globe, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/Navigation'

// Types
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
}

type FormType = 'consultation' | 'partnership'

export default function ContactPage() {
  const { language, setLanguage, t } = useLanguage()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [formType, setFormType] = useState<FormType>('consultation')
  const [footerLogoLoaded, setFooterLogoLoaded] = useState(false)

  const [consultationForm, setConsultationForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [partnershipForm, setPartnershipForm] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    partnershipType: '',
    description: ''
  })

  const [submittedConsultation, setSubmittedConsultation] = useState(false)
  const [submittedPartnership, setSubmittedPartnership] = useState(false)

  // Fetch team members
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoadingTeam(true)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)

        const response = await fetch('/api/team-members', { signal: controller.signal })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error('Failed to fetch team members')
        }
        const data = await response.json()
        setTeamMembers(data.filter((item: TeamMember) => item.active))
      } catch (err) {
        console.error('Error fetching team members:', err)
        setTeamMembers([])
      } finally {
        setLoadingTeam(false)
      }
    }

    fetchTeamMembers()
  }, [])

  // Get title based on language
  const getTitle = (member: TeamMember) => {
    return language === 'id' ? member.titleIndo : member.titleEng
  }

  // Get description based on language
  const getDescription = (member: TeamMember) => {
    return language === 'id' ? member.descriptionIndo : member.descriptionEng
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'founder':
        return 'bg-[#E74C3C] text-white'
      case 'co-founder':
        return 'bg-[#F39C12] text-white'
      case 'professional':
      case 'member':
        return 'bg-[#6B5B95] text-white'
      default:
        return 'bg-gray-700 text-gray-300'
    }
  }

  // Get role label
  const getRoleLabel = (role: string) => {
    const labels: Record<string, { id: string; en: string }> = {
      'founder': { id: 'Founder', en: 'Founder' },
      'co-founder': { id: 'Co-Founder', en: 'Co-Founder' },
      'professional': { id: 'Tenaga Ahli', en: 'Professional' },
      'member': { id: 'Member', en: 'Member' },
      'ceo': { id: 'CEO', en: 'CEO' },
      'cto': { id: 'CTO', en: 'CTO' },
    }
    return labels[role]?.[language] || role
  }

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Consultation form submitted:', consultationForm)
    setSubmittedConsultation(true)
    setTimeout(() => setSubmittedConsultation(false), 3000)
  }

  const handlePartnershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch('/api/partnership/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnershipForm)
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSubmittedPartnership(true)
        // Reset form
        setPartnershipForm({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          partnershipType: '',
          description: ''
        })
        setTimeout(() => setSubmittedPartnership(false), 3000)
      } else {
        alert(language === 'id' ? 'Gagal mengirim permohonan. Silakan coba lagi.' : 'Failed to submit request. Please try again.')
      }
    } catch (error) {
      console.error('Error submitting partnership request:', error)
      alert(language === 'id' ? 'Terjadi kesalahan. Silakan coba lagi.' : 'An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen overflow-hidden" style={{ backgroundColor: '#1E1E1E' }}>
      <div className="relative z-10 h-screen flex flex-col">
        <Navigation />

        {/* Header */}
        <section className="pt-24 pb-12 flex-shrink-0">
          <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">
            <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium mb-4 bg-gradient-to-r from-[#F39C12] via-[#F1C40F] to-[#6B5B95] text-white border-0">
              {t('nav.contact')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#F39C12] via-[#F1C40F] to-[#6B5B95] bg-clip-text text-transparent">
                {language === 'id' ? 'Hubungi Kami' : 'Contact Us'}
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mb-8">
              {language === 'id'
                ? 'Konsultasikan kebutuhan arsitektur Anda dengan tim ahli kami atau jalin kerjasama untuk mengembangkan bisnis Anda'
                : 'Consult your architectural needs with our expert team or build partnerships to grow your business'}
            </p>
          </div>
        </section>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-24">
          <div className="w-full max-w-[95%] lg:max-w-[97%] xl:max-w-[98%] mx-auto px-4 lg:px-6 xl:px-8">

            {/* Concept & How It Works Section */}
            <Card className="mb-12 bg-[#2a2a2a]/80 backdrop-blur-sm border-2 border-[#6B5B95]">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#6B5B95]/30 to-[#E74C3C]/30 rounded-2xl flex items-center justify-center">
                    <Globe className="w-7 h-7 text-[#6B5B95]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {language === 'id' ? 'Apa itu ARCHI-COLL?' : 'What is ARCHI-COLL?'}
                    </h2>
                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-0">
                      {language === 'id' ? 'Platform Kolaborasi Arsitektur' : 'Architecture Collaboration Platform'}
                    </span>
                  </div>
                </div>
                <CardDescription className="text-base text-gray-300 leading-relaxed">
                  {language === 'id'
                    ? 'ARCHI-COLL adalah platform kolaborasi yang menghubungkan klien dengan tenaga ahli arsitektur profesional. Kami menyediakan layanan desain arsitektur berkualitas tinggi dengan standar IAI, memastikan setiap proyek mendapatkan perhatian dari para ahli yang berpengalaman.'
                    : 'ARCHI-COLL is a collaboration platform that connects clients with professional architectural experts. We provide high-quality architectural design services with IAI standards, ensuring every project receives attention from experienced experts.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#F39C12]" />
                  {language === 'id' ? 'Cara Kerja' : 'How It Works'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="p-5 bg-[#6B5B95]/10 rounded-xl border border-[#6B5B95]/30">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] rounded-xl flex items-center justify-center mb-3 text-white font-bold text-lg">
                      1
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">
                      {language === 'id' ? 'Pilih Layanan' : 'Choose Service'}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {language === 'id'
                        ? 'Pilih kategori layanan yang sesuai dengan kebutuhan proyek Anda'
                        : 'Select the service category that matches your project needs'}
                    </p>
                  </div>
                  <div className="p-5 bg-[#E74C3C]/10 rounded-xl border border-[#E74C3C]/30">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#E74C3C] to-[#F39C12] rounded-xl flex items-center justify-center mb-3 text-white font-bold text-lg">
                      2
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">
                      {language === 'id' ? 'Konsultasi Gratis' : 'Free Consultation'}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {language === 'id'
                        ? 'Diskusikan visi Anda dengan tenaga ahli kami secara gratis'
                        : 'Discuss your vision with our experts for free'}
                    </p>
                  </div>
                  <div className="p-5 bg-[#F39C12]/10 rounded-xl border border-[#F39C12]/30">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#F39C12] to-[#F1C40F] rounded-xl flex items-center justify-center mb-3 text-white font-bold text-lg">
                      3
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">
                      {language === 'id' ? 'Proses Desain' : 'Design Process'}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {language === 'id'
                        ? 'Tim ahli akan bekerja untuk mewujudkan desain sesuai standar IAI'
                        : 'Our expert team will work to realize your design according to IAI standards'}
                    </p>
                  </div>
                  <div className="p-5 bg-[#9B59B6]/10 rounded-xl border border-[#9B59B6]/30">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#9B59B6] to-[#6B5B95] rounded-xl flex items-center justify-center mb-3 text-white font-bold text-lg">
                      4
                    </div>
                    <h4 className="text-base font-bold text-white mb-2">
                      {language === 'id' ? 'Realisasi Proyek' : 'Project Realization'}
                    </h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      {language === 'id'
                        ? 'Dapatkan dokumen lengkap dan dukungan hingga proyek selesai'
                        : 'Get complete documents and support until project completion'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members Section */}
            <Card className="mb-12 bg-[#2a2a2a]/80 backdrop-blur-sm border-2 border-[#E74C3C]">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E74C3C]/30 to-[#F39C12]/30 rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-[#E74C3C]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {language === 'id' ? 'Tenaga Ahli Kami' : 'Our Expert Team'}
                    </h2>
                    <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-[#E74C3C] to-[#F39C12] text-white border-0">
                      {language === 'id' ? 'Siap Membantu Anda' : 'Ready to Help You'}
                    </span>
                  </div>
                </div>
                <CardDescription className="text-base text-gray-300">
                  {language === 'id'
                    ? 'Hubungi tenaga ahli kami untuk konsultasi mengenai kebutuhan arsitektur dan konstruksi Anda'
                    : 'Contact our expert team for consultation regarding your architectural and construction needs'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTeam ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="w-10 h-10 text-[#9B59B6] animate-spin" />
                      <p className="text-gray-400">{language === 'id' ? 'Memuat tim...' : 'Loading team...'}</p>
                    </div>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <p className="text-gray-400 text-center py-10">
                    {language === 'id' ? 'Belum ada tenaga ahli yang tersedia' : 'No experts available yet'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {teamMembers
                      .filter(m => ['professional', 'member'].includes(m.role))
                      .sort((a, b) => a.order - b.order)
                      .map((member) => (
                        <Card
                          key={member.id}
                          className="bg-gradient-to-br from-[#6B5B95]/10 to-[#E74C3C]/10 border border-[#6B5B95]/30 transition-all hover:border-[#E74C3C]/50"
                        >
                          <CardContent className="p-5">
                            <div className="text-center">
                              <div className="w-16 h-16 rounded-full mb-4 border-2 border-[#6B5B95] flex items-center justify-center bg-gradient-to-br from-[#6B5B95]/40 to-[#E74C3C]/40 mx-auto">
                                <User className="w-8 h-8 text-white" />
                              </div>

                              <h4 className="text-lg font-bold text-white mb-1">
                                {member.name}
                              </h4>
                              <p className="text-sm text-[#E74C3C] font-semibold mb-2">
                                {getTitle(member)}
                              </p>
                              <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium mb-3 ${getRoleBadgeColor(member.role)} border-0`}>
                                {getRoleLabel(member.role)}
                              </span>
                              {getDescription(member) && (
                                <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3">
                                  {getDescription(member)}
                                </p>
                              )}
                              <div className="flex gap-2 w-full">
                                {member.email && (
                                  <a
                                    href={`mailto:${member.email}`}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white rounded-lg text-xs font-medium no-underline hover:opacity-90 transition-opacity"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                    Email
                                  </a>
                                )}
                                {member.linkedinUrl && (
                                  <a
                                    href={member.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0077B5]/20 text-[#0077B5] rounded-lg text-xs font-medium no-underline border border-[#0077B5]/30 hover:bg-[#0077B5]/30 transition-colors"
                                  >
                                    <Linkedin className="w-3.5 h-3.5" />
                                    LinkedIn
                                  </a>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Forms Section */}
            <div className="mb-12">
              {/* Form Type Toggle */}
              <div className="flex gap-4 mb-6 justify-center">
                <Button
                  onClick={() => setFormType('consultation')}
                  className={
                    formType === 'consultation'
                      ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white'
                      : 'bg-[#2a2a2a]/80 text-white border border-gray-700 hover:bg-gray-800'
                  }
                >
                  <Users className="w-4.5 h-4.5 mr-2" />
                  {language === 'id' ? 'Konsultasi' : 'Consultation'}
                </Button>
                <Button
                  onClick={() => setFormType('partnership')}
                  className={
                    formType === 'partnership'
                      ? 'bg-gradient-to-r from-[#E74C3C] to-[#F39C12] text-white'
                      : 'bg-[#2a2a2a]/80 text-white border border-gray-700 hover:bg-gray-800'
                  }
                >
                  <Handshake className="w-4.5 h-4.5 mr-2" />
                  {language === 'id' ? 'Kerjasama' : 'Partnership'}
                </Button>
              </div>

              {formType === 'consultation' ? (
                /* Consultation Form */
                <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border-2 border-[#9B59B6]">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#9B59B6]/30 to-[#6B5B95]/30 rounded-2xl flex items-center justify-center">
                        <Send className="w-7 h-7 text-[#9B59B6]" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white mb-1">
                          {language === 'id' ? 'Formulir Konsultasi' : 'Consultation Form'}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-300">
                          {language === 'id'
                            ? 'Konsultasikan kebutuhan arsitektur Anda dengan kami'
                            : 'Consult your architectural needs with us'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {submittedConsultation ? (
                      <div className="py-10 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl text-white mb-2">
                          {language === 'id' ? 'Pesan Terkirim!' : 'Message Sent!'}
                        </h3>
                        <p className="text-gray-400">
                          {language === 'id'
                            ? 'Terima kasih. Tim kami akan segera menghubungi Anda.'
                            : 'Thank you. Our team will contact you soon.'}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleConsultationSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'Nama Lengkap' : 'Full Name'} *
                            </label>
                            <input
                              type="text"
                              value={consultationForm.name}
                              onChange={(e) => setConsultationForm({ ...consultationForm, name: e.target.value })}
                              placeholder={language === 'id' ? 'Masukkan nama lengkap' : 'Enter full name'}
                              required
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#9B59B6]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'Email' : 'Email'} *
                            </label>
                            <input
                              type="email"
                              value={consultationForm.email}
                              onChange={(e) => setConsultationForm({ ...consultationForm, email: e.target.value })}
                              placeholder="email@example.com"
                              required
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#9B59B6]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'No. Telepon' : 'Phone Number'}
                            </label>
                            <input
                              type="tel"
                              value={consultationForm.phone}
                              onChange={(e) => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                              placeholder={language === 'id' ? 'Masukkan nomor telepon' : 'Enter phone number'}
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#9B59B6]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'Subjek' : 'Subject'}
                            </label>
                            <input
                              type="text"
                              value={consultationForm.subject}
                              onChange={(e) => setConsultationForm({ ...consultationForm, subject: e.target.value })}
                              placeholder={language === 'id' ? 'Subjek konsultasi' : 'Consultation subject'}
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#9B59B6]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {language === 'id' ? 'Pesan' : 'Message'} *
                          </label>
                          <textarea
                            rows={6}
                            value={consultationForm.message}
                            onChange={(e) => setConsultationForm({ ...consultationForm, message: e.target.value })}
                            placeholder={language === 'id' ? 'Ceritakan tentang kebutuhan arsitektur Anda...' : 'Tell us about your architectural needs...'}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#9B59B6] resize-none leading-relaxed"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white py-4 text-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Send className="w-5 h-5 mr-2" />
                          {language === 'id' ? 'Kirim Pesan Konsultasi' : 'Send Consultation Message'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              ) : (
                /* Partnership Form */
                <Card className="bg-[#2a2a2a]/80 backdrop-blur-sm border-2 border-[#F39C12]">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#F39C12]/30 to-[#E74C3C]/30 rounded-2xl flex items-center justify-center">
                        <Handshake className="w-7 h-7 text-[#F39C12]" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl text-white mb-1">
                          {language === 'id' ? 'Formulir Kerjasama' : 'Partnership Form'}
                        </CardTitle>
                        <CardDescription className="text-base text-gray-300">
                          {language === 'id'
                            ? 'Jalin kerjasama untuk produk konstruksi atau jasa kontraktor'
                            : 'Build partnerships for construction products or contractor services'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {submittedPartnership ? (
                      <div className="py-10 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl text-white mb-2">
                          {language === 'id' ? 'Permohonan Terkirim!' : 'Request Sent!'}
                        </h3>
                        <p className="text-gray-400">
                          {language === 'id'
                            ? 'Terima kasih. Tim kami akan meninjau permohonan kerjasama Anda dan segera menghubungi.'
                            : 'Thank you. Our team will review your partnership request and contact you soon.'}
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handlePartnershipSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'Nama Perusahaan' : 'Company Name'} *
                            </label>
                            <input
                              type="text"
                              value={partnershipForm.companyName}
                              onChange={(e) => setPartnershipForm({ ...partnershipForm, companyName: e.target.value })}
                              placeholder={language === 'id' ? 'Masukkan nama perusahaan' : 'Enter company name'}
                              required
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'Nama Kontak' : 'Contact Person'} *
                            </label>
                            <input
                              type="text"
                              value={partnershipForm.contactPerson}
                              onChange={(e) => setPartnershipForm({ ...partnershipForm, contactPerson: e.target.value })}
                              placeholder={language === 'id' ? 'Masukkan nama kontak' : 'Enter contact person'}
                              required
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'Email' : 'Email'} *
                            </label>
                            <input
                              type="email"
                              value={partnershipForm.email}
                              onChange={(e) => setPartnershipForm({ ...partnershipForm, email: e.target.value })}
                              placeholder="email@example.com"
                              required
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              {language === 'id' ? 'No. Telepon' : 'Phone Number'}
                            </label>
                            <input
                              type="tel"
                              value={partnershipForm.phone}
                              onChange={(e) => setPartnershipForm({ ...partnershipForm, phone: e.target.value })}
                              placeholder={language === 'id' ? 'Masukkan nomor telepon' : 'Enter phone number'}
                              className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {language === 'id' ? 'Jenis Kerjasama' : 'Partnership Type'} *
                          </label>
                          <select
                            value={partnershipForm.partnershipType}
                            onChange={(e) => setPartnershipForm({ ...partnershipForm, partnershipType: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#F39C12]"
                          >
                            <option value="">
                              {language === 'id' ? '-- Pilih jenis kerjasama --' : '-- Select partnership type --'}
                            </option>
                            <option value="product-advertisement">
                              {language === 'id' ? 'Iklan Produk Konstruksi' : 'Construction Product Advertisement'}
                            </option>
                            <option value="contractor-services">
                              {language === 'id' ? 'Iklan Jasa Kontraktor' : 'Contractor Services Advertisement'}
                            </option>
                            <option value="material-supplier">
                              {language === 'id' ? 'Supplier Material' : 'Material Supplier'}
                            </option>
                            <option value="other">
                              {language === 'id' ? 'Lainnya' : 'Other'}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {language === 'id' ? 'Deskripsi Kerjasama' : 'Partnership Description'} *
                          </label>
                          <textarea
                            rows={6}
                            value={partnershipForm.description}
                            onChange={(e) => setPartnershipForm({ ...partnershipForm, description: e.target.value })}
                            placeholder={language === 'id'
                              ? 'Jelaskan tentang produk/jasa yang ingin diiklankan dan bentuk kerjasama yang diharapkan...'
                              : 'Describe the product/service you want to advertise and the expected partnership...'}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-[#1E1E1E] text-white text-base focus:outline-none focus:ring-2 focus:ring-[#F39C12] resize-none leading-relaxed"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#E74C3C] to-[#F39C12] text-white py-4 text-lg font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Send className="w-5 h-5 mr-2" />
                          {language === 'id' ? 'Kirim Permohonan Kerjasama' : 'Send Partnership Request'}
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="bg-gradient-to-br from-[#6B5B95]/20 to-[#6B5B95]/10 border border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    24h
                  </div>
                  <p className="text-sm text-gray-300">
                    {language === 'id' ? 'Respon Email' : 'Email Response'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#F39C12]/20 to-[#F39C12]/10 border border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#F39C12] to-[#F1C40F] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    Free
                  </div>
                  <p className="text-sm text-gray-300">
                    {language === 'id' ? 'Konsultasi Awal' : 'Initial Consultation'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-[#E74C3C]/20 to-[#E74C3C]/10 border border-gray-700">
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 bg-gradient-to-r from-[#E74C3C] to-[#C0392B] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    IAI
                  </div>
                  <p className="text-sm text-gray-300">
                    {language === 'id' ? 'Standar Profesional' : 'Professional Standards'}
                  </p>
                </CardContent>
              </Card>
            </div>

          </div>
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
