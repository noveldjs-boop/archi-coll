'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  Star,
  Calendar,
  ExternalLink,
  FileText,
  Building,
  Clock
} from 'lucide-react'

interface MemberProfile {
  id: string
  name: string
  email: string
  profession: string
  phone?: string
  location?: string
  bio?: string
  profileImage?: string
  experience?: number
  expertise: string[]
  buildingTypes: string[]
  portfolioImages: string[]
  portfolioDescription?: string
  linkedinUrl?: string
  portfolioWebsite?: string
  assistantProjects: Record<string, number>
  certificates: Array<{
    certificateType: string
    certificateNumber: string
    issuer: string
    issuedDate: Date
    expiryDate: Date
    documentUrl?: string
  }>
  portfolioProjects: Array<{
    id: string
    title: string
    description?: string
    category: string
    imageUrls: string[]
    location?: string
    year: number
  }>
  activeProjects: Array<{
    id: string
    title: string
    category: string
    status: string
    role: string
  }>
  ratings: {
    average: number
    count: number
    byExpertise: Record<string, { count: number; average: number }>
  }
  createdAt: Date
  approvedAt?: Date
}

interface ProfileModalProps {
  memberId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ProfileModal({ memberId, open, onOpenChange }: ProfileModalProps) {
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (!memberId) {
        setProfile(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/member/profile/${memberId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch profile')
        }
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [memberId])

  const getProfessionLabel = (profession: string) => {
    const labels: Record<string, string> = {
      architect: 'Arsitek',
      licensed_architect: 'Arsitek Berlisensi',
      structure: 'Struktur',
      mep: 'MEP',
      drafter: 'Drafter',
      qs: 'Quantity Surveyor'
    }
    return labels[profession] || profession
  }

  const getProfessionColor = (profession: string) => {
    const colors: Record<string, string> = {
      architect: 'bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30',
      licensed_architect: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      structure: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      mep: 'bg-green-500/20 text-green-400 border-green-500/30',
      drafter: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      qs: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    }
    return colors[profession] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2a2a] border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9B59B6]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : profile ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-4 border-[#6B5B95]">
                  <AvatarImage src={profile.profileImage} />
                  <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white text-2xl">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-2xl">{profile.name}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 mt-1">
                    <Badge className={getProfessionColor(profile.profession)}>
                      {getProfessionLabel(profile.profession)}
                    </Badge>
                    {profile.ratings.count > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{profile.ratings.average}</span>
                        <span className="text-gray-400">({profile.ratings.count} reviews)</span>
                      </div>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
              <div className="space-y-6 mt-4">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <Phone className="w-5 h-5 text-[#9B59B6]" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-white">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <MapPin className="w-5 h-5 text-[#E74C3C]" />
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-white">{profile.location}</p>
                      </div>
                    </div>
                  )}
                  {profile.experience && (
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-[#F39C12]" />
                      <div>
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="text-white">{profile.experience} years</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#9B59B6]" />
                    <div>
                      <p className="text-xs text-gray-500">Member Since</p>
                      <p className="text-white">{new Date(profile.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#9B59B6]" />
                      About
                    </h3>
                    <p className="text-gray-300">{profile.bio}</p>
                  </div>
                )}

                <Separator className="bg-gray-700" />

                {/* Expertise Areas */}
                {profile.expertise.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#6B5B95]" />
                      Expertise Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.expertise.map((exp) => (
                        <Badge key={exp} variant="outline" className="bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30">
                          {exp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Building Types for Licensed Architects */}
                {profile.profession === 'licensed_architect' && profile.buildingTypes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-purple-400" />
                      Licensed Building Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.buildingTypes.map((type) => (
                        <Badge key={type} variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ratings by Expertise */}
                {Object.keys(profile.ratings.byExpertise).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Ratings by Expertise
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(profile.ratings.byExpertise).map(([expertise, data]) => (
                        <div key={expertise} className="p-3 bg-gray-800/50 rounded-lg">
                          <p className="text-sm font-medium text-white">{expertise}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-white">{data.average}</span>
                            <span className="text-gray-400 text-xs">({data.count})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-700" />

                {/* Certificates */}
                {profile.certificates.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#F39C12]" />
                      Certificates & Licenses
                    </h3>
                    <div className="space-y-2">
                      {profile.certificates.map((cert, idx) => (
                        <div key={idx} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-white">{cert.certificateType}</p>
                              <p className="text-sm text-gray-400">{cert.certificateNumber}</p>
                              <p className="text-xs text-gray-500">{cert.issuer}</p>
                            </div>
                            <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Valid: {new Date(cert.issuedDate).toLocaleDateString()} - {new Date(cert.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="bg-gray-700" />

                {/* Portfolio Projects */}
                {profile.portfolioProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building className="w-5 h-5 text-[#E74C3C]" />
                      Portfolio Projects ({profile.portfolioProjects.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.portfolioProjects.map((project) => (
                        <div key={project.id} className="p-3 bg-gray-800/50 rounded-lg">
                          <Badge variant="outline" className="mb-2 bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30">
                            {project.category}
                          </Badge>
                          <h4 className="font-medium text-white">{project.title}</h4>
                          {project.description && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                          )}
                          {project.location && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {project.location} • {project.year}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Projects */}
                {profile.activeProjects.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      Active Projects ({profile.activeProjects.length})
                    </h3>
                    <div className="space-y-2">
                      {profile.activeProjects.map((project) => (
                        <div key={project.id} className="p-3 bg-gray-800/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-white">{project.title}</p>
                              <p className="text-xs text-gray-500">{project.category}</p>
                            </div>
                            <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                              {project.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(profile.linkedinUrl || profile.portfolioWebsite) && (
                  <>
                    <Separator className="bg-gray-700" />
                    <div className="flex gap-3">
                      {profile.linkedinUrl && (
                        <Button variant="outline" asChild className="bg-gray-800 border-gray-700 text-white">
                          <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                      {profile.portfolioWebsite && (
                        <Button variant="outline" asChild className="bg-gray-800 border-gray-700 text-white">
                          <a href={profile.portfolioWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Portfolio Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
