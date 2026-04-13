"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Building2,
  Image,
  LogOut,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Eye,
  Monitor,
  Info,
  Users,
  UserPlus,
  Phone,
  Clock,
  FileText,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Ban,
  Mail,
  List,
  BarChart3,
  Award,
  User,
  Briefcase,
  MapPin,
  Star,
  Calculator,
  EyeOff,
  Trees,
  Home,
  Building,
  Cpu,
  BadgeCheck,
  Compass,
  Layers,
  Ruler,
  Package,
  Gamepad2,
  Church,
  Factory,
  ChevronUp,
  ChevronDown,
  Handshake
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Icon mapping helper
const iconMap: Record<string, any> = {
  Building2,
  Trees,
  Home,
  Building,
  Cpu,
  FileText,
  BadgeCheck,
  Compass,
  Layers,
  Ruler,
  Package,
  LayoutDashboard,
  Image,
  LogOut,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  Eye,
  Monitor,
  Info,
  Users,
  UserPlus,
  Phone,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Ban,
  Mail,
  List,
  BarChart3,
  Award,
  User,
  Briefcase,
  MapPin,
  Star,
  Calculator,
  EyeOff,
  Handshake
}

// Interfaces
interface ServiceFeature {
  id: string
  serviceId: string
  featureId: string
  textIndo: string
  textEng: string
  order: number
  createdAt: string
  updatedAt: string
}

interface Service {
  id: string
  code: string
  titleId: string
  titleIndo: string
  titleEng: string
  descId: string
  descIndo: string
  descEng: string
  icon: string | null
  imageUrl: string | null
  order: number
  active: boolean
  features: ServiceFeature[]
}

interface Project {
  id: string
  titleIndo: string
  titleEng: string
  descriptionIndo: string
  descriptionEng: string
  imageUrl: string
  category: string
  order: number
  active: boolean
}

interface AboutContent {
  id: string
  section: string
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
  role: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface FormRequirement {
  id: string
  fieldId: string
  profession: string | null
  labelIndo: string
  labelEng: string
  fieldType: string
  required: boolean
  options: string | null
  placeholderIndo: string | null
  placeholderEng: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ContactInfo {
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

interface OperatingHours {
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

interface ContactFormField {
  id: string
  fieldId: string
  labelIndo: string
  labelEng: string
  fieldType: string
  required: boolean
  placeholderIndo: string | null
  placeholderEng: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Member {
  id: string
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  profession: string
  phone: string
  address: string | null
  experience: number | null
  portfolioUrl: string | null
  expertise: string[] | null
  buildingTypes: string[] | null
  portfolioImages: string | null
  portfolioDescription: string | null
  linkedinUrl: string | null
  portfolioWebsite: string | null
  assistantProjects: string | null
  status: string
  approvedAt: string | null
  approvedBy: string | null
  createdAt: string
  updatedAt: string
  certificates: any[]
}

interface PricingRule {
  id: string
  buildingType: string // "low-rise" | "mid-rise" | "high-rise"
  qualityLevel: string // "sederhana" | "menengah" | "mewah"
  pricePerM2: number
  iaiFeeRate: number
  minFloors: number
  maxFloors: number | null
  active: boolean
  descriptionIndo: string | null
  descriptionEng: string | null
  createdAt: string
  updatedAt: string
}

interface ServiceConfig {
  id: string
  serviceKey: string
  labelIndo: string
  labelEng: string
  icon: string | null
  descriptionIndo: string | null
  descriptionEng: string | null
  rate: number
  minFee: number
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface OrderServiceField {
  id: string
  fieldKey: string
  labelIndo: string
  labelEng: string
  fieldType: string
  required: boolean
  placeholderIndo: string | null
  placeholderEng: string | null
  options: string | null
  validation: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface ServiceCategory {
  id: string
  code: string
  nameIndo: string
  nameEng: string
  descriptionIndo: string | null
  descriptionEng: string | null
  icon: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
  subCategories?: SubCategory[]
}

interface SubCategory {
  id: string
  categoryId: string
  category?: ServiceCategory
  code: string
  nameIndo: string
  nameEng: string
  descriptionIndo: string | null
  descriptionEng: string | null
  examplesIndo: string | null
  examplesEng: string | null
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Data states
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [aboutContents, setAboutContents] = useState<AboutContent[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [formRequirements, setFormRequirements] = useState<FormRequirement[]>([])
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([])
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([])
  const [contactFormFields, setContactFormFields] = useState<ContactFormField[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [serviceConfigs, setServiceConfigs] = useState<ServiceConfig[]>([])
  const [orderServiceFields, setOrderServiceFields] = useState<OrderServiceField[]>([])
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all')

  // Dialog states
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false)
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [aboutContentDialogOpen, setAboutContentDialogOpen] = useState(false)
  const [teamMemberDialogOpen, setTeamMemberDialogOpen] = useState(false)
  const [formRequirementDialogOpen, setFormRequirementDialogOpen] = useState(false)
  const [contactInfoDialogOpen, setContactInfoDialogOpen] = useState(false)
  const [operatingHoursDialogOpen, setOperatingHoursDialogOpen] = useState(false)
  const [contactFormFieldDialogOpen, setContactFormFieldDialogOpen] = useState(false)
  const [memberDetailDialogOpen, setMemberDetailDialogOpen] = useState(false)
  const [serviceFeaturesDialogOpen, setServiceFeaturesDialogOpen] = useState(false)
  const [registeredMembersDialogOpen, setRegisteredMembersDialogOpen] = useState(false)
  const [viewingRegisteredMember, setViewingRegisteredMember] = useState<any>(null)
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<any>(null)
  const [registeredMembers, setRegisteredMembers] = useState<any[]>([])
  const [membersFilterStatus, setMembersFilterStatus] = useState('all')
  const [membersFilterProfession, setMembersFilterProfession] = useState('all')
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [activeTab, setActiveTab] = useState('about')
  const [pricingRuleDialogOpen, setPricingRuleDialogOpen] = useState(false)
  const [serviceConfigDialogOpen, setServiceConfigDialogOpen] = useState(false)
  const [orderServiceFieldDialogOpen, setOrderServiceFieldDialogOpen] = useState(false)
  const [serviceCategoryDialogOpen, setServiceCategoryDialogOpen] = useState(false)
  const [subCategoryDialogOpen, setSubCategoryDialogOpen] = useState(false)

  // Editing states
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [editingAboutContent, setEditingAboutContent] = useState<AboutContent | null>(null)
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null)
  const [editingFormRequirement, setEditingFormRequirement] = useState<FormRequirement | null>(null)
  const [editingContactInfo, setEditingContactInfo] = useState<ContactInfo | null>(null)
  const [editingOperatingHours, setEditingOperatingHours] = useState<OperatingHours | null>(null)
  const [editingContactFormField, setEditingContactFormField] = useState<ContactFormField | null>(null)
  const [viewingMember, setViewingMember] = useState<Member | null>(null)
  const [editingServiceFeatures, setEditingServiceFeatures] = useState<Service | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [editingPricingRule, setEditingPricingRule] = useState<PricingRule | null>(null)
  const [editingServiceConfig, setEditingServiceConfig] = useState<ServiceConfig | null>(null)
  const [editingOrderServiceField, setEditingOrderServiceField] = useState<OrderServiceField | null>(null)
  const [editingServiceCategory, setEditingServiceCategory] = useState<ServiceCategory | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)

  // Form states
  const [serviceForm, setServiceForm] = useState({
    code: "",
    titleId: "",
    titleIndo: "",
    titleEng: "",
    descId: "",
    descIndo: "",
    descEng: "",
    icon: "Home",
    imageUrl: "",
    order: 0,
    active: true
  })

  const [serviceFeatureForm, setServiceFeatureForm] = useState({
    textIndo: "",
    textEng: "",
    order: 0
  })

  const [projectForm, setProjectForm] = useState({
    titleIndo: "",
    titleEng: "",
    descriptionIndo: "",
    descriptionEng: "",
    imageUrl: "",
    category: "residential",
    order: 0,
    active: true
  })

  const [aboutContentForm, setAboutContentForm] = useState({
    section: "",
    contentIndo: "",
    contentEng: "",
    order: 0
  })

  const [teamMemberForm, setTeamMemberForm] = useState({
    name: "",
    titleIndo: "",
    titleEng: "",
    descriptionIndo: "",
    descriptionEng: "",
    imageUrl: "",
    linkedinUrl: "",
    email: "",
    role: "professional",
    order: 0,
    active: true
  })

  const [formRequirementForm, setFormRequirementForm] = useState({
    fieldId: "",
    profession: "" as string | null,
    labelIndo: "",
    labelEng: "",
    fieldType: "text",
    required: true,
    options: "",
    placeholderIndo: "",
    placeholderEng: "",
    order: 0,
    active: true
  })

  const [selectedFormProfession, setSelectedFormProfession] = useState<string>("architect")

  const [contactInfoForm, setContactInfoForm] = useState({
    type: "address",
    labelIndo: "",
    labelEng: "",
    valueIndo: "",
    valueEng: "",
    icon: "MapPin",
    order: 0,
    active: true
  })

  const [operatingHoursForm, setOperatingHoursForm] = useState({
    day: "",
    labelIndo: "",
    labelEng: "",
    openTime: "09:00",
    closeTime: "17:00",
    closed: false,
    order: 0
  })

  const [contactFormFieldForm, setContactFormFieldForm] = useState({
    fieldId: "",
    labelIndo: "",
    labelEng: "",
    fieldType: "text",
    required: true,
    placeholderIndo: "",
    placeholderEng: "",
    order: 0,
    active: true
  })

  const [pricingRuleForm, setPricingRuleForm] = useState({
    buildingType: "low-rise",
    qualityLevel: "sederhana",
    pricePerM2: 0,
    iaiFeeRate: 0.065,
    minFloors: 0,
    maxFloors: null as number | null,
    descriptionIndo: "",
    descriptionEng: "",
    active: true
  })

  const [serviceConfigForm, setServiceConfigForm] = useState({
    serviceKey: "",
    labelIndo: "",
    labelEng: "",
    icon: "Calculator",
    descriptionIndo: "",
    descriptionEng: "",
    rate: 0.10,
    minFee: 5000000,
    order: 0,
    active: true
  })

  const [orderServiceFieldForm, setOrderServiceFieldForm] = useState({
    fieldKey: "",
    labelIndo: "",
    labelEng: "",
    fieldType: "text",
    required: true,
    placeholderIndo: "",
    placeholderEng: "",
    options: "",
    validation: "",
    order: 0,
    active: true
  })

  const [serviceCategoryForm, setServiceCategoryForm] = useState({
    code: "",
    nameIndo: "",
    nameEng: "",
    descriptionIndo: "",
    descriptionEng: "",
    icon: "Home",
    order: 0,
    active: true
  })

  const [subCategoryForm, setSubCategoryForm] = useState({
    categoryId: "",
    code: "",
    nameIndo: "",
    nameEng: "",
    descriptionIndo: "",
    descriptionEng: "",
    examplesIndo: "",
    examplesEng: "",
    order: 0,
    active: true
  })

  // Options
  const iconOptions = [
    "Home", "Building2", "Gamepad2", "Building", "Church", "Factory",
    "Hotel", "Store", "Villa", "Coffee", "Layers", "Layout",
    "FileText", "Image", "Video", "Music", "Clock", "Calendar", "MapPin", "Phone",
    "Mail", "Globe", "Share2", "Download", "Upload", "Settings", "User", "Users",
    "Linkedin", "Instagram", "Facebook", "Twitter", "Youtube"
  ]

  const professions = [
    { id: 'architect', label: 'Desain Arsitek' },
    { id: 'licensed_architect', label: 'Arsitek Berlisensi' },
    { id: 'structure', label: 'Desain Struktur' },
    { id: 'mep', label: 'Desain MEP' },
    { id: 'drafter', label: 'Drafter' },
    { id: 'qs', label: 'QS (Quantity Surveyor)' }
  ]

  const memberRoles = [
    { id: 'founder', label: 'Founder' },
    { id: 'co-founder', label: 'Co-Founder' },
    { id: 'ceo', label: 'CEO' },
    { id: 'cto', label: 'CTO' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'hr', label: 'HR' },
    { id: 'qa', label: 'QA' },
    { id: 'project-director', label: 'Project Director' },
    { id: 'legal-director', label: 'Legal Director' },
    { id: 'marketing-director', label: 'Marketing Director' },
    { id: 'finance-director', label: 'Finance Director' },
    { id: 'it-director', label: 'IT Director' },
    { id: 'promotion-director', label: 'Promotion Director' },
    { id: 'hrd-director', label: 'HRD Director' },
    { id: 'public-relations-director', label: 'Public Relations Director' },
    { id: 'professional', label: 'Professional' },
    { id: 'member', label: 'Member' }
  ]

  const founderLeadershipRoles = [
    'founder', 'co-founder', 'ceo', 'cto', 'marketing', 'hr', 'qa',
    'project-director', 'legal-director', 'marketing-director', 'finance-director',
    'it-director', 'promotion-director', 'hrd-director', 'public-relations-director'
  ]

  const tenagaAhliRoles = ['professional', 'member']

  const fieldTypes = [
    { id: 'text', label: 'Text' },
    { id: 'email', label: 'Email' },
    { id: 'tel', label: 'Phone' },
    { id: 'textarea', label: 'Textarea' },
    { id: 'select', label: 'Select' },
    { id: 'file', label: 'File Upload' },
    { id: 'date', label: 'Date' }
  ]

  const contactInfoTypes = [
    { id: 'address', label: 'Alamat' },
    { id: 'phone', label: 'Telepon' },
    { id: 'email', label: 'Email' },
    { id: 'whatsapp', label: 'WhatsApp' }
  ]

  const daysOfWeek = [
    { id: 'monday', labelIndo: 'Senin', labelEng: 'Monday' },
    { id: 'tuesday', labelIndo: 'Selasa', labelEng: 'Tuesday' },
    { id: 'wednesday', labelIndo: 'Rabu', labelEng: 'Wednesday' },
    { id: 'thursday', labelIndo: 'Kamis', labelEng: 'Thursday' },
    { id: 'friday', labelIndo: 'Jumat', labelEng: 'Friday' },
    { id: 'saturday', labelIndo: 'Sabtu', labelEng: 'Saturday' },
    { id: 'sunday', labelIndo: 'Minggu', labelEng: 'Sunday' }
  ]

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login")
    } else if (status === "authenticated") {
      // Check if user has the correct role
      if (session?.user?.role !== "editor") {
        // Redirect to appropriate dashboard based on role
        if (session?.user?.role === "finance") {
          router.push("/finance")
        } else if (session?.user?.role === "marketing") {
          router.push("/marketing")
        } else if (session?.user?.role === "hrd") {
          router.push("/hrd")
        } else {
          // Default to admin portal for other roles
          router.push("/admin/login")
        }
        return
      }
      
      if (loading) {
        fetchData().catch(err => {
          console.error("Failed to fetch data:", err)
          setLoading(false)
        })
      }
    }
  }, [status, session])

  useEffect(() => {
    if (activeTab === 'registered-members') {
      fetchRegisteredMembers()
    }
    if (activeTab === 'pricing-rules') {
      fetchPricingRules()
    }
    if (activeTab === 'service-pricing') {
      fetchServiceConfigs()
    }
    if (activeTab === 'order-service-fields') {
      fetchOrderServiceFields()
    }
    if (activeTab === 'service-categories' || activeTab === 'services') {
      fetchServiceCategories()
    }
    if (activeTab === 'sub-categories') {
      fetchSubCategories()
    }
  }, [activeTab, membersFilterStatus, membersFilterProfession, selectedCategoryFilter])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout fetching data')), 10000)
      )

      // Create fetch promises with error handling
      const createSafeFetch = async (url: string) => {
        try {
          const response = await fetch(url).catch(e => ({ ok: false, error: e }))
          if (response.ok && 'json' in response) {
            const data = await response.json()
            return { data, ok: true }
          }
          return { ok: false, error: (response as any).error || 'Fetch failed' }
        } catch (error) {
          return { ok: false, error }
        }
      }

      const fetchAll = async () => {
        return Promise.all([
          createSafeFetch("/api/admin/services"),
          createSafeFetch("/api/admin/projects"),
          createSafeFetch("/api/admin/about-content"),
          createSafeFetch("/api/admin/team-members"),
          createSafeFetch("/api/admin/form-requirements"),
          createSafeFetch("/api/admin/contact-info"),
          createSafeFetch("/api/admin/operating-hours"),
          createSafeFetch("/api/admin/contact-form-fields"),
          createSafeFetch("/api/admin/members"),
          createSafeFetch("/api/pricing-rules"),
          createSafeFetch("/api/admin/order-service-fields")
        ])
      }

      const result = await Promise.race([fetchAll(), timeoutPromise])
      
      const [
        servicesData,
        projectsData,
        aboutContentsData,
        teamMembersData,
        formRequirementsData,
        contactInfosData,
        operatingHoursData,
        contactFormFieldsData,
        membersData,
        pricingRulesData,
        orderServiceFieldsData
      ] = result

      // Process responses with error handling
      if (servicesData.ok) setServices(servicesData.data || [])
      if (projectsData.ok) setProjects(projectsData.data || [])
      if (aboutContentsData.ok) setAboutContents(aboutContentsData.data || [])
      if (teamMembersData.ok) setTeamMembers(teamMembersData.data || [])
      if (formRequirementsData.ok) setFormRequirements(formRequirementsData.data || [])
      if (contactInfosData.ok) setContactInfos(contactInfosData.data || [])
      if (operatingHoursData.ok) setOperatingHours(operatingHoursData.data || [])
      if (contactFormFieldsData.ok) setContactFormFields(contactFormFieldsData.data || [])
      if (membersData.ok) setMembers(membersData.data || [])
      if (pricingRulesData.ok) setPricingRules(pricingRulesData.data?.data || [])
      if (orderServiceFieldsData.ok) setOrderServiceFields(orderServiceFieldsData.data?.data || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      if (error.message === 'Timeout fetching data') {
        toast({ title: "Timeout", description: "Gagal memuat data dalam 10 detik", variant: "destructive" })
      } else {
        toast({ title: "Gagal memuat data", description: error.message || "Terjadi kesalahan", variant: "destructive" })
      }
    } finally {
      setLoading(false)
    }
  }

  // Registered Members functions
  const fetchRegisteredMembers = async () => {
    setLoadingMembers(true)
    try {
      const url = new URL('/api/admin/members', window.location.origin)
      if (membersFilterStatus !== 'all') {
        url.searchParams.set('status', membersFilterStatus)
      }
      if (membersFilterProfession !== 'all') {
        url.searchParams.set('profession', membersFilterProfession)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        setRegisteredMembers(data.members || [])
      }
    } catch (error) {
      console.error('Error fetching registered members:', error)
      toast({ title: 'Gagal memuat data member', variant: 'destructive' })
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleViewRegisteredMember = (member: any) => {
    setViewingRegisteredMember(member)
    setRegisteredMembersDialogOpen(true)
  }

  const handleDeleteMemberClick = (member: any) => {
    setMemberToDelete(member)
    setDeleteMemberDialogOpen(true)
  }

  const handleDeleteMember = async () => {
    if (!memberToDelete) return

    try {
      const response = await fetch(`/api/admin/members/${memberToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({ title: 'Member berhasil dihapus' })
        setDeleteMemberDialogOpen(false)
        setMemberToDelete(null)
        fetchRegisteredMembers()
      } else {
        const data = await response.json()
        toast({ title: data.error || 'Gagal menghapus member', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting member:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleLogout = async () => {
    try {
      await router.push('/admin/login')
      // Clear session after redirect starts
      await signOut({ redirect: false })
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/admin/login'
    }
  }

  // Pricing Rules handlers
  const fetchPricingRules = async () => {
    try {
      const response = await fetch('/api/pricing-rules')
      if (response.ok) {
        const result = await response.json()
        setPricingRules(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching pricing rules:', error)
      toast({ title: 'Gagal memuat data pricing rules', variant: 'destructive' })
    }
  }

  const handleSavePricingRule = async () => {
    // Validation
    if (pricingRuleForm.pricePerM2 <= 0) {
      toast({ title: 'Validasi Gagal', description: 'Harga per m² harus lebih dari 0', variant: 'destructive' })
      return
    }
    if (pricingRuleForm.iaiFeeRate <= 0 || pricingRuleForm.iaiFeeRate > 1) {
      toast({ title: 'Validasi Gagal', description: 'IAI Fee Rate harus antara 0 dan 1', variant: 'destructive' })
      return
    }
    if (pricingRuleForm.minFloors < 0) {
      toast({ title: 'Validasi Gagal', description: 'Min Floors tidak boleh negatif', variant: 'destructive' })
      return
    }
    if (pricingRuleForm.maxFloors !== null && pricingRuleForm.maxFloors <= pricingRuleForm.minFloors) {
      toast({ title: 'Validasi Gagal', description: 'Max Floors harus lebih besar dari Min Floors', variant: 'destructive' })
      return
    }

    try {
      const url = editingPricingRule
        ? `/api/pricing-rules/${editingPricingRule.id}`
        : '/api/pricing-rules'
      const method = editingPricingRule ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pricingRuleForm)
      })

      if (response.ok) {
        toast({ title: editingPricingRule ? 'Pricing Rule berhasil diperbarui' : 'Pricing Rule berhasil ditambahkan' })
        setPricingRuleDialogOpen(false)
        setEditingPricingRule(null)
        resetPricingRuleForm()
        fetchPricingRules()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast({ title: 'Gagal menyimpan pricing rule', description: errorData.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving pricing rule:', error)
      toast({ title: 'Gagal menyimpan pricing rule', variant: 'destructive' })
    }
  }

  const handleDeletePricingRule = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pricing rule ini?')) return

    try {
      const response = await fetch(`/api/pricing-rules/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Pricing Rule berhasil dihapus' })
        fetchPricingRules()
      } else {
        toast({ title: 'Gagal menghapus pricing rule', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleEditPricingRule = (rule: PricingRule) => {
    setEditingPricingRule(rule)
    setPricingRuleForm({
      buildingType: rule.buildingType,
      qualityLevel: rule.qualityLevel,
      pricePerM2: rule.pricePerM2,
      iaiFeeRate: rule.iaiFeeRate,
      minFloors: rule.minFloors,
      maxFloors: rule.maxFloors,
      descriptionIndo: rule.descriptionIndo || '',
      descriptionEng: rule.descriptionEng || '',
      active: rule.active
    })
    setPricingRuleDialogOpen(true)
  }

  const handleTogglePricingRuleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/pricing-rules/${id}/toggle`, {
        method: 'PUT'
      })

      if (response.ok) {
        toast({
          title: currentActive ? 'Pricing Rule dinonaktifkan' : 'Pricing Rule diaktifkan',
          description: currentActive ? 'Pricing Rule tidak akan digunakan' : 'Pricing Rule akan digunakan'
        })
        fetchPricingRules()
      } else {
        toast({ title: 'Gagal mengubah status', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error toggling pricing rule status:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const resetPricingRuleForm = () => {
    setPricingRuleForm({
      buildingType: 'low-rise',
      qualityLevel: 'sederhana',
      pricePerM2: 0,
      iaiFeeRate: 0.065,
      minFloors: 0,
      maxFloors: null,
      descriptionIndo: '',
      descriptionEng: '',
      active: true
    })
  }

  // Order Service Fields handlers
  const fetchOrderServiceFields = async () => {
    try {
      const response = await fetch('/api/admin/order-service-fields')
      if (response.ok) {
        const result = await response.json()
        setOrderServiceFields(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching order service fields:', error)
      toast({ title: 'Gagal memuat data form field', variant: 'destructive' })
    }
  }

  const handleSaveOrderServiceField = async () => {
    // Validation
    if (!orderServiceFieldForm.fieldKey?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Field Key wajib diisi', variant: 'destructive' })
      return
    }
    if (!orderServiceFieldForm.labelIndo?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Label (Indo) wajib diisi', variant: 'destructive' })
      return
    }
    if (!orderServiceFieldForm.labelEng?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Label (Eng) wajib diisi', variant: 'destructive' })
      return
    }
    // Validate options for select field type
    if (orderServiceFieldForm.fieldType === 'select' && !orderServiceFieldForm.options?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Options wajib diisi untuk field type select (format JSON)', variant: 'destructive' })
      return
    }
    if (orderServiceFieldForm.options?.trim()) {
      try {
        JSON.parse(orderServiceFieldForm.options)
      } catch (e) {
        toast({ title: 'Validasi Gagal', description: 'Format options tidak valid (harus JSON)', variant: 'destructive' })
        return
      }
    }

    try {
      const url = editingOrderServiceField
        ? '/api/admin/order-service-fields'
        : '/api/admin/order-service-fields'
      const method = editingOrderServiceField ? 'PUT' : 'POST'

      const payload = editingOrderServiceField
        ? { id: editingOrderServiceField.id, ...orderServiceFieldForm }
        : orderServiceFieldForm

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({ title: editingOrderServiceField ? 'Form field berhasil diperbarui' : 'Form field berhasil ditambahkan' })
        setOrderServiceFieldDialogOpen(false)
        setEditingOrderServiceField(null)
        resetOrderServiceFieldForm()
        fetchOrderServiceFields()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast({ title: 'Gagal menyimpan form field', description: errorData.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving order service field:', error)
      toast({ title: 'Gagal menyimpan form field', variant: 'destructive' })
    }
  }

  const handleDeleteOrderServiceField = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus form field ini?')) return

    try {
      const response = await fetch(`/api/admin/order-service-fields?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Form field berhasil dihapus' })
        fetchOrderServiceFields()
      } else {
        toast({ title: 'Gagal menghapus form field', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting order service field:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleEditOrderServiceField = (field: OrderServiceField) => {
    setEditingOrderServiceField(field)
    setOrderServiceFieldForm({
      fieldKey: field.fieldKey,
      labelIndo: field.labelIndo,
      labelEng: field.labelEng,
      fieldType: field.fieldType,
      required: field.required,
      placeholderIndo: field.placeholderIndo || '',
      placeholderEng: field.placeholderEng || '',
      options: field.options || '',
      validation: field.validation || '',
      order: field.order,
      active: field.active
    })
    setOrderServiceFieldDialogOpen(true)
  }

  const resetOrderServiceFieldForm = () => {
    setOrderServiceFieldForm({
      fieldKey: '',
      labelIndo: '',
      labelEng: '',
      fieldType: 'text',
      required: true,
      placeholderIndo: '',
      placeholderEng: '',
      options: '',
      validation: '',
      order: 0,
      active: true
    })
  }

  // Service Category handlers
  const fetchServiceCategories = async () => {
    try {
      const response = await fetch('/api/admin/service-categories')
      if (response.ok) {
        const result = await response.json()
        setServiceCategories(result || [])
      }
    } catch (error) {
      console.error('Error fetching service categories:', error)
      toast({ title: 'Gagal memuat data kategori layanan', variant: 'destructive' })
    }
  }

  const handleSaveServiceCategory = async () => {
    // Validation
    if (!serviceCategoryForm.code?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Code wajib diisi', variant: 'destructive' })
      return
    }
    if (!serviceCategoryForm.nameIndo?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Nama (Indo) wajib diisi', variant: 'destructive' })
      return
    }
    if (!serviceCategoryForm.nameEng?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Name (Eng) wajib diisi', variant: 'destructive' })
      return
    }

    try {
      const method = editingServiceCategory ? 'PUT' : 'POST'
      const payload = editingServiceCategory
        ? { id: editingServiceCategory.id, ...serviceCategoryForm }
        : serviceCategoryForm

      const response = await fetch('/api/admin/service-categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({ title: editingServiceCategory ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan' })
        setServiceCategoryDialogOpen(false)
        setEditingServiceCategory(null)
        resetServiceCategoryForm()
        fetchServiceCategories()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast({ title: 'Gagal menyimpan kategori', description: errorData.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving service category:', error)
      toast({ title: 'Gagal menyimpan kategori', variant: 'destructive' })
    }
  }

  const handleDeleteServiceCategory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini? Semua sub-kategori dalam kategori ini juga akan dihapus.')) return

    try {
      const response = await fetch(`/api/admin/service-categories?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Kategori berhasil dihapus' })
        fetchServiceCategories()
      } else {
        toast({ title: 'Gagal menghapus kategori', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting service category:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleEditServiceCategory = (category: ServiceCategory) => {
    setEditingServiceCategory(category)
    setServiceCategoryForm({
      code: category.code,
      nameIndo: category.nameIndo,
      nameEng: category.nameEng,
      descriptionIndo: category.descriptionIndo || '',
      descriptionEng: category.descriptionEng || '',
      icon: category.icon || 'Home',
      order: category.order,
      active: category.active
    })
    setServiceCategoryDialogOpen(true)
  }

  const handleToggleServiceCategoryActive = async (id: string, currentActive: boolean) => {
    try {
      const category = serviceCategories.find(c => c.id === id)
      if (!category) return

      const response = await fetch('/api/admin/service-categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      })

      if (response.ok) {
        toast({
          title: currentActive ? 'Kategori dinonaktifkan' : 'Kategori diaktifkan',
          description: currentActive ? 'Kategori tidak akan ditampilkan' : 'Kategori akan ditampilkan'
        })
        fetchServiceCategories()
      } else {
        toast({ title: 'Gagal mengubah status', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error toggling service category status:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleMoveServiceCategory = async (id: string, direction: 'up' | 'down') => {
    const categories = [...serviceCategories]
    const index = categories.findIndex(c => c.id === id)
    
    if (direction === 'up' && index > 0) {
      [categories[index], categories[index - 1]] = [categories[index - 1], categories[index]]
    } else if (direction === 'down' && index < categories.length - 1) {
      [categories[index], categories[index + 1]] = [categories[index + 1], categories[index]]
    } else {
      return
    }

    try {
      for (const [idx, category] of categories.entries()) {
        await fetch('/api/admin/service-categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: category.id, order: idx })
        })
      }
      
      fetchServiceCategories()
    } catch (error) {
      console.error('Error reordering service categories:', error)
      toast({ title: 'Gagal mengubah urutan', variant: 'destructive' })
    }
  }

  const resetServiceCategoryForm = () => {
    setServiceCategoryForm({
      code: '',
      nameIndo: '',
      nameEng: '',
      descriptionIndo: '',
      descriptionEng: '',
      icon: 'Home',
      order: 0,
      active: true
    })
  }

  // Sub Category handlers
  const fetchSubCategories = async () => {
    try {
      const url = selectedCategoryFilter !== 'all'
        ? `/api/admin/sub-categories?categoryId=${selectedCategoryFilter}`
        : '/api/admin/sub-categories'
      const response = await fetch(url)
      if (response.ok) {
        const result = await response.json()
        setSubCategories(result || [])
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', error)
      toast({ title: 'Gagal memuat data sub-kategori', variant: 'destructive' })
    }
  }

  const handleSaveSubCategory = async () => {
    // Validation
    if (!subCategoryForm.categoryId) {
      toast({ title: 'Validasi Gagal', description: 'Kategori wajib dipilih', variant: 'destructive' })
      return
    }
    if (!subCategoryForm.code?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Code wajib diisi', variant: 'destructive' })
      return
    }
    if (!subCategoryForm.nameIndo?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Nama (Indo) wajib diisi', variant: 'destructive' })
      return
    }
    if (!subCategoryForm.nameEng?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Name (Eng) wajib diisi', variant: 'destructive' })
      return
    }
    
    // Validate JSON for examples
    if (subCategoryForm.examplesIndo?.trim()) {
      try {
        JSON.parse(subCategoryForm.examplesIndo)
      } catch (e) {
        toast({ title: 'Validasi Gagal', description: 'Examples (Indo) harus format JSON array yang valid', variant: 'destructive' })
        return
      }
    }
    
    if (subCategoryForm.examplesEng?.trim()) {
      try {
        JSON.parse(subCategoryForm.examplesEng)
      } catch (e) {
        toast({ title: 'Validasi Gagal', description: 'Examples (Eng) harus format JSON array yang valid', variant: 'destructive' })
        return
      }
    }

    try {
      const method = editingSubCategory ? 'PUT' : 'POST'
      const payload = editingSubCategory
        ? { id: editingSubCategory.id, ...subCategoryForm }
        : subCategoryForm

      const response = await fetch('/api/admin/sub-categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({ title: editingSubCategory ? 'Sub-kategori berhasil diperbarui' : 'Sub-kategori berhasil ditambahkan' })
        setSubCategoryDialogOpen(false)
        setEditingSubCategory(null)
        resetSubCategoryForm()
        fetchSubCategories()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast({ title: 'Gagal menyimpan sub-kategori', description: errorData.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving sub-category:', error)
      toast({ title: 'Gagal menyimpan sub-kategori', variant: 'destructive' })
    }
  }

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus sub-kategori ini?')) return

    try {
      const response = await fetch(`/api/admin/sub-categories?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Sub-kategori berhasil dihapus' })
        fetchSubCategories()
      } else {
        toast({ title: 'Gagal menghapus sub-kategori', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting sub-category:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory)
    setSubCategoryForm({
      categoryId: subCategory.categoryId,
      code: subCategory.code,
      nameIndo: subCategory.nameIndo,
      nameEng: subCategory.nameEng,
      descriptionIndo: subCategory.descriptionIndo || '',
      descriptionEng: subCategory.descriptionEng || '',
      examplesIndo: subCategory.examplesIndo || '',
      examplesEng: subCategory.examplesEng || '',
      order: subCategory.order,
      active: subCategory.active
    })
    setSubCategoryDialogOpen(true)
  }

  const resetSubCategoryForm = () => {
    setSubCategoryForm({
      categoryId: '',
      code: '',
      nameIndo: '',
      nameEng: '',
      descriptionIndo: '',
      descriptionEng: '',
      examplesIndo: '',
      examplesEng: '',
      order: 0,
      active: true
    })
  }

  // Orders handlers
  // Service Config handlers
  const fetchServiceConfigs = async () => {
    try {
      const response = await fetch('/api/admin/service-config')
      if (response.ok) {
        const result = await response.json()
        setServiceConfigs(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching service configs:', error)
      toast({ title: 'Gagal memuat data layanan', variant: 'destructive' })
    }
  }

  const handleSaveServiceConfig = async () => {
    // Validation
    if (!serviceConfigForm.serviceKey?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Service Key wajib diisi', variant: 'destructive' })
      return
    }
    if (!serviceConfigForm.labelIndo?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Nama Layanan (Indo) wajib diisi', variant: 'destructive' })
      return
    }
    if (!serviceConfigForm.labelEng?.trim()) {
      toast({ title: 'Validasi Gagal', description: 'Service Name (Eng) wajib diisi', variant: 'destructive' })
      return
    }
    if (serviceConfigForm.rate < 0 || serviceConfigForm.rate > 1) {
      toast({ title: 'Validasi Gagal', description: 'Rate harus antara 0 dan 1 (0-100%)', variant: 'destructive' })
      return
    }
    if (serviceConfigForm.minFee < 0) {
      toast({ title: 'Validasi Gagal', description: 'Minimum Fee tidak boleh negatif', variant: 'destructive' })
      return
    }

    try {
      const url = editingServiceConfig
        ? '/api/admin/service-config'
        : '/api/admin/service-config'
      const method = editingServiceConfig ? 'PUT' : 'POST'

      const payload = editingServiceConfig
        ? { id: editingServiceConfig.id, ...serviceConfigForm }
        : serviceConfigForm

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        toast({ title: editingServiceConfig ? 'Layanan berhasil diperbarui' : 'Layanan berhasil ditambahkan' })
        setServiceConfigDialogOpen(false)
        setEditingServiceConfig(null)
        resetServiceConfigForm()
        fetchServiceConfigs()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        toast({ title: 'Gagal menyimpan layanan', description: errorData.error || 'Terjadi kesalahan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error saving service config:', error)
      toast({ title: 'Gagal menyimpan layanan', variant: 'destructive' })
    }
  }

  const handleDeleteServiceConfig = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus layanan ini?')) return

    try {
      const response = await fetch(`/api/admin/service-config?id=${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: 'Layanan berhasil dihapus' })
        fetchServiceConfigs()
      } else {
        toast({ title: 'Gagal menghapus layanan', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error deleting service config:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleEditServiceConfig = (config: ServiceConfig) => {
    setEditingServiceConfig(config)
    setServiceConfigForm({
      serviceKey: config.serviceKey,
      labelIndo: config.labelIndo,
      labelEng: config.labelEng,
      icon: config.icon || "Calculator",
      descriptionIndo: config.descriptionIndo || '',
      descriptionEng: config.descriptionEng || '',
      rate: config.rate,
      minFee: config.minFee,
      order: config.order,
      active: config.active
    })
    setServiceConfigDialogOpen(true)
  }

  const handleToggleServiceConfigActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/admin/service-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive })
      })

      if (response.ok) {
        toast({
          title: currentActive ? 'Layanan dinonaktifkan' : 'Layanan diaktifkan',
          description: currentActive ? 'Layanan tidak akan digunakan' : 'Layanan akan digunakan'
        })
        fetchServiceConfigs()
      } else {
        toast({ title: 'Gagal mengubah status', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Error toggling service config status:', error)
      toast({ title: 'Terjadi kesalahan', variant: 'destructive' })
    }
  }

  const handleMoveServiceConfig = async (id: string, direction: 'up' | 'down') => {
    const configs = [...serviceConfigs]
    const index = configs.findIndex(c => c.id === id)
    
    if (direction === 'up' && index > 0) {
      // Swap with previous
      [configs[index], configs[index - 1]] = [configs[index - 1], configs[index]]
    } else if (direction === 'down' && index < configs.length - 1) {
      // Swap with next
      [configs[index], configs[index + 1]] = [configs[index + 1], configs[index]]
    } else {
      return // Cannot move
    }

    // Update order values
    const updates = configs.map((config, idx) => ({
      id: config.id,
      order: idx
    }))

    try {
      // Send updates one by one
      for (const update of updates) {
        await fetch('/api/admin/service-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        })
      }
      
      fetchServiceConfigs()
    } catch (error) {
      console.error('Error reordering service configs:', error)
      toast({ title: 'Gagal mengubah urutan', variant: 'destructive' })
    }
  }

  const resetServiceConfigForm = () => {
    setServiceConfigForm({
      serviceKey: '',
      labelIndo: '',
      labelEng: '',
      icon: 'Calculator',
      descriptionIndo: '',
      descriptionEng: '',
      rate: 0.10,
      minFee: 5000000,
      order: 0,
      active: true
    })
  }

  // Service handlers
  const handleSaveService = async () => {
    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : "/api/admin/services"
      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceForm)
      })

      if (response.ok) {
        toast({ title: editingService ? "Service berhasil diperbarui" : "Service berhasil ditambahkan" })
        setServiceDialogOpen(false)
        setEditingService(null)
        resetServiceForm()
        fetchData()
      } else {
        toast({ title: "Gagal menyimpan service", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving service:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus service ini?")) return

    try {
      const response = await fetch(`/api/admin/services/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Service berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus service", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting service:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      code: service.code,
      titleId: service.titleId,
      titleIndo: service.titleIndo,
      titleEng: service.titleEng,
      descId: service.descId,
      descIndo: service.descIndo,
      descEng: service.descEng,
      icon: service.icon || "Home",
      imageUrl: service.imageUrl || "",
      order: service.order,
      active: service.active
    })
    setServiceDialogOpen(true)
  }

  const resetServiceForm = () => {
    setServiceForm({
      code: "",
      titleId: "",
      titleIndo: "",
      titleEng: "",
      descId: "",
      descIndo: "",
      descEng: "",
      icon: "Home",
      imageUrl: "",
      order: 0,
      active: true
    })
  }

  // Service feature handlers
  const handleOpenServiceFeatures = async (service: Service) => {
    setEditingServiceFeatures(service)
    setServiceFeaturesDialogOpen(true)
  }

  const handleSaveServiceFeature = async () => {
    if (!editingServiceFeatures) return

    try {
      const response = await fetch(`/api/admin/services/${editingServiceFeatures.id}/features`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceFeatureForm)
      })

      if (response.ok) {
        toast({ title: "Fitur berhasil ditambahkan" })
        // Refresh the service to get updated features
        const updatedService = await fetch(`/api/admin/services/${editingServiceFeatures.id}`).then(r => r.json())
        setEditingServiceFeatures(updatedService)
        // Update services list
        setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
        setServiceFeatureForm({ textIndo: "", textEng: "", order: 0 })
      } else {
        toast({ title: "Gagal menambahkan fitur", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving service feature:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleDeleteServiceFeature = async (featureId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus fitur ini?")) return

    try {
      const response = await fetch(`/api/admin/service-features/${featureId}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Fitur berhasil dihapus" })
        // Refresh the service to get updated features
        if (editingServiceFeatures) {
          const updatedService = await fetch(`/api/admin/services/${editingServiceFeatures.id}`).then(r => r.json())
          setEditingServiceFeatures(updatedService)
          // Update services list
          setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
        }
      } else {
        toast({ title: "Gagal menghapus fitur", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting service feature:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditServiceFeature = (feature: ServiceFeature) => {
    setServiceFeatureForm({
      textIndo: feature.textIndo,
      textEng: feature.textEng,
      order: feature.order
    })
  }

  const handleUpdateServiceFeature = async (featureId: string) => {
    try {
      const response = await fetch(`/api/admin/service-features/${featureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serviceFeatureForm)
      })

      if (response.ok) {
        toast({ title: "Fitur berhasil diperbarui" })
        // Refresh the service to get updated features
        if (editingServiceFeatures) {
          const updatedService = await fetch(`/api/admin/services/${editingServiceFeatures.id}`).then(r => r.json())
          setEditingServiceFeatures(updatedService)
          // Update services list
          setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
        }
        setServiceFeatureForm({ textIndo: "", textEng: "", order: 0 })
      } else {
        toast({ title: "Gagal memperbarui fitur", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating service feature:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  // Service image upload handler
  const handleUploadServiceImage = async (serviceId: string, file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      toast({ title: "Ukuran file terlalu besar", description: "Maksimal 1MB", variant: "destructive" })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Tipe file tidak valid", description: "Hanya JPEG, PNG, GIF, dan WebP yang diperbolehkan", variant: "destructive" })
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/services/${serviceId}/upload-image`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: "Gambar berhasil diupload" })
        // Update services list
        setServices(services.map(s => s.id === data.service.id ? data.service : s))
        // Update form if editing
        if (editingService && editingService.id === serviceId) {
          setServiceForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({ title: "Gagal upload gambar", description: errorData.error, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error uploading service image:", error)
      toast({ title: "Terjadi kesalahan saat upload gambar", variant: "destructive" })
    } finally {
      setUploadingImage(false)
    }
  }

  // Project image upload handler
  const handleUploadProjectImage = async (projectId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Ukuran file terlalu besar", description: "Maksimal 5MB", variant: "destructive" })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Tipe file tidak valid", description: "Hanya JPEG, PNG, GIF, WebP, dan SVG yang diperbolehkan", variant: "destructive" })
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/projects/${projectId}/upload-image`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: "Gambar berhasil diupload" })
        // Update projects list
        setProjects(projects.map(p => p.id === data.project.id ? data.project : p))
        // Update form if editing
        if (editingProject && editingProject.id === projectId) {
          setProjectForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({ title: "Gagal upload gambar", description: errorData.error, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error uploading project image:", error)
      toast({ title: "Terjadi kesalahan saat upload gambar", variant: "destructive" })
    } finally {
      setUploadingImage(false)
    }
  }

  // Team member photo upload handler
  const handleUploadTeamMemberPhoto = async (teamMemberId: string, file: File) => {
    if (file.size > 1 * 1024 * 1024) {
      toast({ title: "Ukuran file terlalu besar", description: "Maksimal 1MB", variant: "destructive" })
      return
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Tipe file tidak valid", description: "Hanya JPEG, PNG, GIF, dan WebP yang diperbolehkan", variant: "destructive" })
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/admin/team-members/${teamMemberId}/upload-photo`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        toast({ title: "Foto profil berhasil diupload" })
        // Update team members list
        setTeamMembers(teamMembers.map(tm => tm.id === data.teamMember.id ? data.teamMember : tm))
        // Update form if editing
        if (editingTeamMember && editingTeamMember.id === teamMemberId) {
          setTeamMemberForm(prev => ({ ...prev, imageUrl: data.imageUrl }))
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        toast({ title: "Gagal upload foto", description: errorData.error, variant: "destructive" })
      }
    } catch (error) {
      console.error("Error uploading team member photo:", error)
      toast({ title: "Terjadi kesalahan saat upload foto", variant: "destructive" })
    } finally {
      setUploadingImage(false)
    }
  }

  // Project handlers
  const handleSaveProject = async () => {
    try {
      const url = editingProject
        ? `/api/admin/projects/${editingProject.id}`
        : "/api/admin/projects"
      const method = editingProject ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm)
      })

      if (response.ok) {
        toast({ title: editingProject ? "Project berhasil diperbarui" : "Project berhasil ditambahkan" })
        setProjectDialogOpen(false)
        setEditingProject(null)
        resetProjectForm()
        fetchData()
      } else {
        toast({ title: "Gagal menyimpan project", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving project:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus project ini?")) return

    try {
      const response = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Project berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus project", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting project:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectForm({
      titleIndo: project.titleIndo,
      titleEng: project.titleEng,
      descriptionIndo: project.descriptionIndo || "",
      descriptionEng: project.descriptionEng || "",
      imageUrl: project.imageUrl || "",
      category: project.category,
      order: project.order,
      active: project.active
    })
    setProjectDialogOpen(true)
  }

  const resetProjectForm = () => {
    setProjectForm({
      titleIndo: "",
      titleEng: "",
      descriptionIndo: "",
      descriptionEng: "",
      imageUrl: "",
      category: "residential",
      order: 0,
      active: true
    })
  }

  // AboutContent handlers
  const handleSaveAboutContent = async () => {
    try {
      // Validation: Check required fields
      if (!aboutContentForm.section?.trim()) {
        toast({ title: "Validasi Gagal", description: "Section wajib diisi (vision/mission/values)", variant: "destructive" })
        return
      }
      if (!aboutContentForm.contentIndo?.trim()) {
        toast({ title: "Validasi Gagal", description: "Content (Indo) wajib diisi", variant: "destructive" })
        return
      }
      if (!aboutContentForm.contentEng?.trim()) {
        toast({ title: "Validasi Gagal", description: "Content (Eng) wajib diisi", variant: "destructive" })
        return
      }

      let response: Response
      let isUpdate = false

      if (editingAboutContent) {
        // UPDATE existing content
        isUpdate = true
        response = await fetch(`/api/admin/about-content/${editingAboutContent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aboutContentForm)
        })
      } else {
        // CREATE new content (only if section doesn't exist)
        // Check if section already exists
        const checkResponse = await fetch("/api/admin/about-content")
        if (checkResponse.ok) {
          const existingContents = await checkResponse.json()
          const sectionExists = existingContents.find((c: any) => c.section === aboutContentForm.section)
          
          if (sectionExists) {
            toast({ 
              title: "Section sudah ada", 
              description: `Section "${aboutContentForm.section}" sudah ada. Gunakan tombol Edit di tabel untuk mengedit.`,
              variant: "destructive" 
            })
            return
          }
        }
        
        // Create new
        isUpdate = false
        response = await fetch("/api/admin/about-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aboutContentForm)
        })
      }

      if (response.ok) {
        toast({ 
          title: isUpdate ? "Konten berhasil diperbarui" : "Konten berhasil ditambahkan", 
          description: isUpdate ? "Perubahan telah tersimpan" : "Konten baru telah ditambahkan"
        })
        setAboutContentDialogOpen(false)
        setEditingAboutContent(null)
        resetAboutContentForm()
        fetchData()
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error saving about content:", errorData)
        toast({ 
          title: "Gagal menyimpan konten", 
          description: errorData.error || "Terjadi kesalahan",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Error saving about content:", error)
      toast({ 
        title: "Gagal menyimpan konten", 
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive" 
      })
    }
  }

  const handleDeleteAboutContent = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus konten ini?")) return

    try {
      const response = await fetch(`/api/admin/about-content/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Konten berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus konten", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting about content:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditAboutContent = (content: AboutContent) => {
    setEditingAboutContent(content)
    setAboutContentForm({
      section: content.section,
      contentIndo: content.contentIndo,
      contentEng: content.contentEng,
      order: content.order
    })
    setAboutContentDialogOpen(true)
  }

  const resetAboutContentForm = () => {
    setAboutContentForm({
      section: "",
      contentIndo: "",
      contentEng: "",
      order: 0
    })
  }

  // TeamMember handlers
  const handleSaveTeamMember = async () => {
    try {
      // Validation: Check required fields
      if (!teamMemberForm.name?.trim()) {
        toast({ title: "Validasi Gagal", description: "Nama wajib diisi", variant: "destructive" })
        return
      }

      const url = editingTeamMember
        ? `/api/admin/team-members/${editingTeamMember.id}`
        : "/api/admin/team-members"
      const method = editingTeamMember ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamMemberForm)
      })

      if (response.ok) {
        toast({ title: editingTeamMember ? "Team member berhasil diperbarui" : "Team member berhasil ditambahkan" })
        setTeamMemberDialogOpen(false)
        setEditingTeamMember(null)
        resetTeamMemberForm()
        fetchData()
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error saving team member:", errorData)
        toast({ 
          title: "Gagal menyimpan team member", 
          description: errorData.error || "Terjadi kesalahan",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Error saving team member:", error)
      toast({ 
        title: "Gagal menyimpan team member", 
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive" 
      })
    }
  }

  const handleDeleteTeamMember = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus team member ini?")) return

    try {
      const response = await fetch(`/api/admin/team-members/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Team member berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus team member", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleToggleTeamMemberActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/team-members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        toast({
          title: currentActive ? "Team member dinonaktifkan" : "Team member diaktifkan",
          description: currentActive 
            ? "Team member tidak akan muncul di website" 
            : "Team member akan muncul di website"
        })
        fetchData()
      } else {
        toast({ title: "Gagal mengubah status", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error toggling team member status:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member)
    setTeamMemberForm({
      name: member.name,
      titleIndo: member.titleIndo,
      titleEng: member.titleEng,
      descriptionIndo: member.descriptionIndo || "",
      descriptionEng: member.descriptionEng || "",
      imageUrl: member.imageUrl || "",
      linkedinUrl: member.linkedinUrl || "",
      email: member.email || "",
      role: member.role,
      order: member.order,
      active: member.active
    })
    setTeamMemberDialogOpen(true)
  }

  const resetTeamMemberForm = () => {
    setTeamMemberForm({
      name: "",
      titleIndo: "",
      titleEng: "",
      descriptionIndo: "",
      descriptionEng: "",
      imageUrl: "",
      linkedinUrl: "",
      email: "",
      role: "professional",
      order: 0,
      active: true
    })
  }

  // FormRequirement handlers
  const handleSaveFormRequirement = async () => {
    try {
      // Validation: Check required fields
      if (!formRequirementForm.fieldId?.trim()) {
        toast({ title: "Validasi Gagal", description: "Field ID wajib diisi", variant: "destructive" })
        return
      }
      if (!formRequirementForm.labelIndo?.trim()) {
        toast({ title: "Validasi Gagal", description: "Label (Indo) wajib diisi", variant: "destructive" })
        return
      }
      if (!formRequirementForm.labelEng?.trim()) {
        toast({ title: "Validasi Gagal", description: "Label (Eng) wajib diisi", variant: "destructive" })
        return
      }

      const url = editingFormRequirement
        ? `/api/admin/form-requirements/${editingFormRequirement.id}`
        : "/api/admin/form-requirements"
      const method = editingFormRequirement ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formRequirementForm)
      })

      if (response.ok) {
        toast({ title: editingFormRequirement ? "Form field berhasil diperbarui" : "Form field berhasil ditambahkan" })
        setFormRequirementDialogOpen(false)
        setEditingFormRequirement(null)
        resetFormRequirementForm()
        fetchData()
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error saving form requirement:", errorData)
        toast({ 
          title: "Gagal menyimpan form field", 
          description: errorData.error || "Terjadi kesalahan",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Error saving form requirement:", error)
      toast({ 
        title: "Gagal menyimpan form field", 
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive" 
      })
    }
  }

  const handleDeleteFormRequirement = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus form field ini?")) return

    try {
      const response = await fetch(`/api/admin/form-requirements/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Form field berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus form field", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting form requirement:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleToggleFormRequirementActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/form-requirements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        toast({
          title: currentActive ? "Persyaratan dinonaktifkan" : "Persyaratan diaktifkan",
          description: currentActive 
            ? "Persyaratan tidak akan muncul di website" 
            : "Persyaratan akan muncul di website"
        })
        fetchData()
      } else {
        toast({ title: "Gagal mengubah status", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error toggling form requirement status:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditFormRequirement = (req: FormRequirement) => {
    setEditingFormRequirement(req)
    setFormRequirementForm({
      fieldId: req.fieldId,
      profession: req.profession,
      labelIndo: req.labelIndo,
      labelEng: req.labelEng,
      fieldType: req.fieldType,
      required: req.required,
      options: req.options || "",
      placeholderIndo: req.placeholderIndo || "",
      placeholderEng: req.placeholderEng || "",
      order: req.order,
      active: req.active
    })
    setFormRequirementDialogOpen(true)
  }

  const resetFormRequirementForm = () => {
    setFormRequirementForm({
      fieldId: "",
      profession: "",
      labelIndo: "",
      labelEng: "",
      fieldType: "text",
      required: true,
      options: "",
      placeholderIndo: "",
      placeholderEng: "",
      order: 0,
      active: true
    })
  }

  // ContactInfo handlers
  const handleSaveContactInfo = async () => {
    try {
      // Validation: Check required fields
      if (!contactInfoForm.type?.trim()) {
        toast({ title: "Validasi Gagal", description: "Type wajib diisi", variant: "destructive" })
        return
      }
      if (!contactInfoForm.labelIndo?.trim()) {
        toast({ title: "Validasi Gagal", description: "Label (Indo) wajib diisi", variant: "destructive" })
        return
      }
      if (!contactInfoForm.labelEng?.trim()) {
        toast({ title: "Validasi Gagal", description: "Label (Eng) wajib diisi", variant: "destructive" })
        return
      }

      const url = editingContactInfo
        ? `/api/admin/contact-info/${editingContactInfo.id}`
        : "/api/admin/contact-info"
      const method = editingContactInfo ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactInfoForm)
      })

      if (response.ok) {
        toast({ title: editingContactInfo ? "Contact info berhasil diperbarui" : "Contact info berhasil ditambahkan" })
        setContactInfoDialogOpen(false)
        setEditingContactInfo(null)
        resetContactInfoForm()
        fetchData()
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error saving contact info:", errorData)
        toast({ 
          title: "Gagal menyimpan contact info", 
          description: errorData.error || "Terjadi kesalahan",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Error saving contact info:", error)
      toast({ 
        title: "Gagal menyimpan contact info", 
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive" 
      })
    }
  }

  const handleDeleteContactInfo = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus contact info ini?")) return

    try {
      const response = await fetch(`/api/admin/contact-info/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Contact info berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus contact info", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting contact info:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleToggleContactInfoActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/contact-info/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        toast({
          title: currentActive ? "Kontak dinonaktifkan" : "Kontak diaktifkan",
          description: currentActive 
            ? "Kontak tidak akan muncul di website" 
            : "Kontak akan muncul di website"
        })
        fetchData()
      } else {
        toast({ title: "Gagal mengubah status", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error toggling contact info status:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditContactInfo = (info: ContactInfo) => {
    setEditingContactInfo(info)
    setContactInfoForm({
      type: info.type,
      labelIndo: info.labelIndo,
      labelEng: info.labelEng,
      valueIndo: info.valueIndo,
      valueEng: info.valueEng,
      icon: info.icon,
      order: info.order,
      active: info.active
    })
    setContactInfoDialogOpen(true)
  }

  const resetContactInfoForm = () => {
    setContactInfoForm({
      type: "address",
      labelIndo: "",
      labelEng: "",
      valueIndo: "",
      valueEng: "",
      icon: "MapPin",
      order: 0,
      active: true
    })
  }

  // OperatingHours handlers
  const handleSaveOperatingHours = async () => {
    try {
      const url = editingOperatingHours
        ? `/api/admin/operating-hours/${editingOperatingHours.id}`
        : "/api/admin/operating-hours"
      const method = editingOperatingHours ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(operatingHoursForm)
      })

      if (response.ok) {
        toast({ title: editingOperatingHours ? "Jam operasional berhasil diperbarui" : "Jam operasional berhasil ditambahkan" })
        setOperatingHoursDialogOpen(false)
        setEditingOperatingHours(null)
        resetOperatingHoursForm()
        fetchData()
      } else {
        toast({ title: "Gagal menyimpan jam operasional", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving operating hours:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleDeleteOperatingHours = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jam operasional ini?")) return

    try {
      const response = await fetch(`/api/admin/operating-hours/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Jam operasional berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus jam operasional", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting operating hours:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditOperatingHours = (hours: OperatingHours) => {
    setEditingOperatingHours(hours)
    setOperatingHoursForm({
      day: hours.day,
      labelIndo: hours.labelIndo,
      labelEng: hours.labelEng,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      closed: hours.closed,
      order: hours.order
    })
    setOperatingHoursDialogOpen(true)
  }

  const resetOperatingHoursForm = () => {
    setOperatingHoursForm({
      day: "",
      labelIndo: "",
      labelEng: "",
      openTime: "09:00",
      closeTime: "17:00",
      closed: false,
      order: 0
    })
  }

  // ContactFormField handlers
  const handleSaveContactFormField = async () => {
    try {
      // Validation: Check required fields
      if (!contactFormFieldForm.fieldId?.trim()) {
        toast({ title: "Validasi Gagal", description: "Field ID wajib diisi", variant: "destructive" })
        return
      }
      if (!contactFormFieldForm.labelIndo?.trim()) {
        toast({ title: "Validasi Gagal", description: "Label (Indo) wajib diisi", variant: "destructive" })
        return
      }
      if (!contactFormFieldForm.labelEng?.trim()) {
        toast({ title: "Validasi Gagal", description: "Label (Eng) wajib diisi", variant: "destructive" })
        return
      }

      const url = editingContactFormField
        ? `/api/admin/contact-form-fields/${editingContactFormField.id}`
        : "/api/admin/contact-form-fields"
      const method = editingContactFormField ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactFormFieldForm)
      })

      if (response.ok) {
        toast({ title: editingContactFormField ? "Contact form field berhasil diperbarui" : "Contact form field berhasil ditambahkan" })
        setContactFormFieldDialogOpen(false)
        setEditingContactFormField(null)
        resetContactFormFieldForm()
        fetchData()
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error saving contact form field:", errorData)
        toast({ 
          title: "Gagal menyimpan form field", 
          description: errorData.error || "Terjadi kesalahan",
          variant: "destructive" 
        })
      }
    } catch (error) {
      console.error("Error saving contact form field:", error)
      toast({ 
        title: "Gagal menyimpan form field", 
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive" 
      })
    }
  }

  const handleDeleteContactFormField = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus contact form field ini?")) return

    try {
      const response = await fetch(`/api/admin/contact-form-fields/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast({ title: "Contact form field berhasil dihapus" })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus contact form field", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting contact form field:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleToggleContactFormFieldActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/contact-form-fields/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      })

      if (response.ok) {
        toast({
          title: currentActive ? "Form field dinonaktifkan" : "Form field diaktifkan",
          description: currentActive 
            ? "Form field tidak akan muncul di website" 
            : "Form field akan muncul di website"
        })
        fetchData()
      } else {
        toast({ title: "Gagal mengubah status", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error toggling contact form field status:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleEditContactFormField = (field: ContactFormField) => {
    setEditingContactFormField(field)
    setContactFormFieldForm({
      fieldId: field.fieldId,
      labelIndo: field.labelIndo,
      labelEng: field.labelEng,
      fieldType: field.fieldType,
      required: field.required,
      placeholderIndo: field.placeholderIndo || "",
      placeholderEng: field.placeholderEng || "",
      order: field.order,
      active: field.active
    })
    setContactFormFieldDialogOpen(true)
  }

  const resetContactFormFieldForm = () => {
    setContactFormFieldForm({
      fieldId: "",
      labelIndo: "",
      labelEng: "",
      fieldType: "text",
      required: true,
      placeholderIndo: "",
      placeholderEng: "",
      order: 0,
      active: true
    })
  }

  // Member handlers
  const handleViewMember = (member: Member) => {
    setViewingMember(member)
    setMemberDetailDialogOpen(true)
  }

  const handleUpdateMemberStatus = async (memberId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/members/${memberId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        toast({ title: `Status member berhasil diperbarui menjadi ${status}` })
        fetchData()
      } else {
        toast({ title: "Gagal memperbarui status member", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating member status:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

  const handleDeleteRegisteredMember = async (memberId: string, memberEmail: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus member ini? Email "${memberEmail}" akan dihapus permanen dan tidak dapat dikembalikan.`)) return

    try {
      const response = await fetch(`/api/admin/members/${memberId}/delete`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast({ 
          title: "Member berhasil dihapus", 
          description: `Email ${memberEmail} sekarang tersedia untuk pendaftaran ulang` 
        })
        fetchData()
      } else {
        toast({ title: "Gagal menghapus member", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error deleting member:", error)
      toast({ title: "Terjadi kesalahan", variant: "destructive" })
    }
  }

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

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'founder': 'Founder',
      'co-founder': 'Co-Founder',
      'member': 'Member',
      'professional': 'Professional',
      'ceo': 'CEO',
      'cto': 'CTO',
      'marketing': 'Marketing',
      'hr': 'HR',
      'qa': 'QA',
      'project-director': 'Project Director',
      'legal-director': 'Legal Director',
      'marketing-director': 'Marketing Director',
      'finance-director': 'Finance Director',
      'it-director': 'IT Director',
      'promotion-director': 'Promotion Director',
      'hrd-director': 'HRD Director',
      'public-relations-director': 'Public Relations Director'
    }
    return labels[role] || role
  }

  const getProfessionLabel = (profession: string) => {
    const labels: Record<string, string> = {
      'architect': 'Desain Arsitek',
      'licensed_architect': 'Arsitek Berlisensi',
      'structure': 'Desain Struktur',
      'mep': 'Desain MEP',
      'drafter': 'Drafter',
      'qs': 'QS (Quantity Surveyor)'
    }
    return labels[profession] || profession
  }

  const getExpertiseLabel = (expertise: string) => {
    const labels: Record<string, string> = {
      'residential': 'Residential',
      'hospital': 'Hospital',
      'villa': 'Villa',
      'cafe_resto': 'Caffe & Resto',
      'apartment': 'Apartment',
      'commercial': 'Commercial'
    }
    return labels[expertise] || expertise
  }

  const getBuildingTypeLabel = (buildingType: string) => {
    const labels: Record<string, string> = {
      'low-rise': 'Low-rise (≤ 4 lantai)',
      'mid-rise': 'Mid-rise (5-15 lantai)',
      'high-rise': 'High-rise (> 15 lantai)'
    }
    return labels[buildingType] || buildingType
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30"><Check className="w-3 h-3 mr-1" />Aktif</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
      case 'suspended':
        return <Badge className="bg-orange-500/20 text-orange-400 hover:bg-orange-500/30"><Ban className="w-3 h-3 mr-1" />Suspended</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Memuat...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#6B5B95] to-[#8B7AB8] p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-gray-400">ARCHI-COLL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="container mx-auto px-4 py-8 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700 flex-wrap">
            <TabsTrigger value="about" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Info className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
            <TabsTrigger value="join-member" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Join Member
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Tenaga Ahli
            </TabsTrigger>
            <TabsTrigger value="registered-members" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <UserCheck className="w-4 h-4 mr-2" />
              Registered Members
            </TabsTrigger>
            <TabsTrigger value="pricing-rules" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Pricing Rules
            </TabsTrigger>
            <TabsTrigger value="service-pricing" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Award className="w-4 h-4 mr-2" />
              Konfigurasi Layanan
            </TabsTrigger>
            <TabsTrigger value="order-service-fields" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Pengelolaan Form
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Services
            </TabsTrigger>
            <TabsTrigger value="service-categories" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Home className="w-4 h-4 mr-2" />
              Kategori Layanan
            </TabsTrigger>
            <TabsTrigger value="sub-categories" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Layers className="w-4 h-4 mr-2" />
              Sub Kategori
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <Image className="w-4 h-4 mr-2" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="home-stats" className="data-[state=active]:bg-[#6B5B95] data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Home Stats
            </TabsTrigger>
          </TabsList>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            {/* About Content Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Vision & Mission</h2>
                <Dialog open={aboutContentDialogOpen} onOpenChange={setAboutContentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingAboutContent(null)
                        resetAboutContentForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Konten
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAboutContent ? "Edit Konten" : "Tambah Konten Baru"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Isi detail konten Vision/Mission dalam bahasa Indonesia dan Inggris
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Section</Label>
                        <Input
                          value={aboutContentForm.section}
                          onChange={(e) => setAboutContentForm({ ...aboutContentForm, section: e.target.value })}
                          placeholder="vision, mission, dll"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Content (Indo)</Label>
                        <Textarea
                          value={aboutContentForm.contentIndo}
                          onChange={(e) => setAboutContentForm({ ...aboutContentForm, contentIndo: e.target.value })}
                          placeholder="Konten dalam bahasa Indonesia"
                          className="bg-gray-700/50 border-gray-600 min-h-[120px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Content (Eng)</Label>
                        <Textarea
                          value={aboutContentForm.contentEng}
                          onChange={(e) => setAboutContentForm({ ...aboutContentForm, contentEng: e.target.value })}
                          placeholder="Content in English"
                          className="bg-gray-700/50 border-gray-600 min-h-[120px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={aboutContentForm.order}
                          onChange={(e) => setAboutContentForm({ ...aboutContentForm, order: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setAboutContentDialogOpen(false)
                            setEditingAboutContent(null)
                            resetAboutContentForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveAboutContent}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Konten</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/30">
                        <TableHead className="text-gray-300">Section</TableHead>
                        <TableHead className="text-gray-300">Content (Indo)</TableHead>
                        <TableHead className="text-gray-300">Order</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aboutContents.map((content) => (
                        <TableRow key={content.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell className="text-white font-medium">{content.section}</TableCell>
                          <TableCell className="text-gray-300 max-w-md truncate">{content.contentIndo}</TableCell>
                          <TableCell className="text-gray-300">{content.order}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => handleEditAboutContent(content)}
                                  className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteAboutContent(content.id)}
                                  className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add New Content Button */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tambah Konten Vision/Mission/Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    Tambah Vision, Mission, atau Values baru. Section harus unik (tidak boleh duplikat).
                  </p>
                  <Button
                    onClick={() => {
                      setEditingAboutContent(null)
                      resetAboutContentForm()
                      setAboutContentDialogOpen(true)
                    }}
                    className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Konten Baru
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Team Members Section */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-[#6B5B95] to-[#E74C3C] p-2 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Team Members</h2>
                  <p className="text-sm text-gray-400">Kelola Founder, Leadership, dan Tenaga Ahli</p>
                </div>
              </div>

              {/* Founder & Leadership Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#F39C12]" />
                      Founder & Leadership
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Founder, Co-Founder, CEO, CTO, Marketing, HR, QA</p>
                  </div>
                  <Dialog open={teamMemberDialogOpen} onOpenChange={setTeamMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        onClick={() => {
                          setEditingTeamMember(null)
                          resetTeamMemberForm()
                          setTeamMemberForm(prev => ({ ...prev, role: 'founder' }))
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Leader
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTeamMember ? "Edit Team Member" : "Tambah Team Member Baru"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Isi detail team member
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama</Label>
                          <Input
                            value={teamMemberForm.name}
                            onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                            placeholder="Nama lengkap"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Jabatan (Indo)</Label>
                            <Input
                              value={teamMemberForm.titleIndo}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, titleIndo: e.target.value })}
                              placeholder="Jabatan dalam bahasa Indonesia"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Jabatan (Eng)</Label>
                            <Input
                              value={teamMemberForm.titleEng}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, titleEng: e.target.value })}
                              placeholder="Position in English"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Deskripsi (Indo)</Label>
                            <Textarea
                              value={teamMemberForm.descriptionIndo}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, descriptionIndo: e.target.value })}
                              placeholder="Deskripsi dalam bahasa Indonesia"
                              className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Deskripsi (Eng)</Label>
                            <Textarea
                              value={teamMemberForm.descriptionEng}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, descriptionEng: e.target.value })}
                              placeholder="Description in English"
                              className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                            />
                          </div>
                        </div>
                        {/* Photo Upload Section */}
                        <div className="space-y-2">
                          <Label>Foto Profil (Maksimal 1MB, Format: JPEG, PNG, GIF, WebP)</Label>
                          <div className="space-y-3">
                            {teamMemberForm.imageUrl && (
                              <div className="flex justify-start">
                                <img
                                  src={teamMemberForm.imageUrl}
                                  alt="Profile Preview"
                                  className="w-32 h-32 object-cover rounded-full border-4 border-gray-600"
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file && editingTeamMember) {
                                      handleUploadTeamMemberPhoto(editingTeamMember.id, file)
                                    }
                                  }}
                                  disabled={!editingTeamMember || uploadingImage}
                                  className="bg-gray-700/50 border-gray-600"
                                />
                                {uploadingImage && (
                                  <span className="text-sm text-gray-400">Uploading...</span>
                                )}
                              </div>
                              <div>
                                <Label className="text-xs text-gray-400">Atau masukkan URL gambar:</Label>
                                <Input
                                  type="text"
                                  value={teamMemberForm.imageUrl}
                                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, imageUrl: e.target.value })}
                                  placeholder="https://example.com/photo.jpg"
                                  className="bg-gray-700/50 border-gray-600 text-sm mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={teamMemberForm.email}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                              placeholder="email@example.com"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input
                              value={teamMemberForm.linkedinUrl}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, linkedinUrl: e.target.value })}
                              placeholder="https://linkedin.com/in/username"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                              value={teamMemberForm.role}
                              onValueChange={(value) => setTeamMemberForm({ ...teamMemberForm, role: value })}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {memberRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={teamMemberForm.order}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, order: parseInt(e.target.value) || 0 })}
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={teamMemberForm.active.toString()}
                              onValueChange={(value) => setTeamMemberForm({ ...teamMemberForm, active: value === "true" })}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTeamMemberDialogOpen(false)
                              setEditingTeamMember(null)
                              resetTeamMemberForm()
                            }}
                            className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Batal
                          </Button>
                          <Button
                            onClick={handleSaveTeamMember}
                            className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Simpan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-gradient-to-br from-[#6B5B95]/10 to-[#E74C3C]/10 border border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Daftar Founder & Leadership</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamMembers.filter(m => founderLeadershipRoles.includes(m.role)).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada Founder & Leadership</p>
                        <p className="text-sm">Klik "Tambah Leader" untuk menambahkan</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-700/30">
                            <TableHead className="text-gray-300">Image</TableHead>
                            <TableHead className="text-gray-300">Nama</TableHead>
                            <TableHead className="text-gray-300">Jabatan</TableHead>
                            <TableHead className="text-gray-300">Role</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers
                            .filter(m => founderLeadershipRoles.includes(m.role))
                            .sort((a, b) => a.order - b.order)
                            .map((member) => (
                              <TableRow key={member.id} className="border-gray-700 hover:bg-gray-700/30">
                                <TableCell>
                                  {member.imageUrl ? (
                                    <img
                                      src={member.imageUrl}
                                      alt={member.name}
                                      className="w-12 h-12 object-cover rounded-full"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                      <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-white font-medium">{member.name}</div>
                                  <div className="text-gray-400 text-sm">{member.email || '-'}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-gray-300">{member.titleIndo}</div>
                                  <div className="text-gray-400 text-sm">{member.titleEng}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${getRoleBadgeColor(member.role)}`}>
                                    {getRoleLabel(member.role)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={member.active}
                                      onCheckedChange={() => handleToggleTeamMemberActive(member.id, member.active)}
                                      className="data-[state=checked]:bg-green-500"
                                    />
                                    <span className={`text-sm ${member.active ? 'text-green-400' : 'text-gray-400'}`}>
                                      {member.active ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                      <DropdownMenuItem
                                        onClick={() => handleEditTeamMember(member)}
                                        className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteTeamMember(member.id)}
                                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Hapus
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Professional Team Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#6B5B95]" />
                      Tenaga Ahli
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">Tenaga ahli profesional yang akan mereview pendaftar baru</p>
                  </div>
                  <Dialog open={teamMemberDialogOpen} onOpenChange={setTeamMemberDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        onClick={() => {
                          setEditingTeamMember(null)
                          resetTeamMemberForm()
                          setTeamMemberForm(prev => ({ ...prev, role: 'professional' }))
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Tenaga Ahli
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTeamMember ? "Edit Team Member" : "Tambah Team Member Baru"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Isi detail team member
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama</Label>
                          <Input
                            value={teamMemberForm.name}
                            onChange={(e) => setTeamMemberForm({ ...teamMemberForm, name: e.target.value })}
                            placeholder="Nama lengkap"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Jabatan (Indo)</Label>
                            <Input
                              value={teamMemberForm.titleIndo}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, titleIndo: e.target.value })}
                              placeholder="Jabatan dalam bahasa Indonesia"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Jabatan (Eng)</Label>
                            <Input
                              value={teamMemberForm.titleEng}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, titleEng: e.target.value })}
                              placeholder="Position in English"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Deskripsi (Indo)</Label>
                            <Textarea
                              value={teamMemberForm.descriptionIndo}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, descriptionIndo: e.target.value })}
                              placeholder="Deskripsi dalam bahasa Indonesia"
                              className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Deskripsi (Eng)</Label>
                            <Textarea
                              value={teamMemberForm.descriptionEng}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, descriptionEng: e.target.value })}
                              placeholder="Description in English"
                              className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                            />
                          </div>
                        </div>
                        {/* Photo Upload Section */}
                        <div className="space-y-2">
                          <Label>Foto Profil (Maksimal 1MB, Format: JPEG, PNG, GIF, WebP)</Label>
                          <div className="space-y-3">
                            {teamMemberForm.imageUrl && (
                              <div className="flex justify-start">
                                <img
                                  src={teamMemberForm.imageUrl}
                                  alt="Profile Preview"
                                  className="w-32 h-32 object-cover rounded-full border-4 border-gray-600"
                                />
                              </div>
                            )}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file && editingTeamMember) {
                                      handleUploadTeamMemberPhoto(editingTeamMember.id, file)
                                    }
                                  }}
                                  disabled={!editingTeamMember || uploadingImage}
                                  className="bg-gray-700/50 border-gray-600"
                                />
                                {uploadingImage && (
                                  <span className="text-sm text-gray-400">Uploading...</span>
                                )}
                              </div>
                              <div>
                                <Label className="text-xs text-gray-400">Atau masukkan URL gambar:</Label>
                                <Input
                                  type="text"
                                  value={teamMemberForm.imageUrl}
                                  onChange={(e) => setTeamMemberForm({ ...teamMemberForm, imageUrl: e.target.value })}
                                  placeholder="https://example.com/photo.jpg"
                                  className="bg-gray-700/50 border-gray-600 text-sm mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={teamMemberForm.email}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, email: e.target.value })}
                              placeholder="email@example.com"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input
                              value={teamMemberForm.linkedinUrl}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, linkedinUrl: e.target.value })}
                              placeholder="https://linkedin.com/in/username"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                              value={teamMemberForm.role}
                              onValueChange={(value) => setTeamMemberForm({ ...teamMemberForm, role: value })}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                {memberRoles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>{role.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={teamMemberForm.order}
                              onChange={(e) => setTeamMemberForm({ ...teamMemberForm, order: parseInt(e.target.value) || 0 })}
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={teamMemberForm.active.toString()}
                              onValueChange={(value) => setTeamMemberForm({ ...teamMemberForm, active: value === "true" })}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setTeamMemberDialogOpen(false)
                              setEditingTeamMember(null)
                              resetTeamMemberForm()
                            }}
                            className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Batal
                          </Button>
                          <Button
                            onClick={handleSaveTeamMember}
                            className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Simpan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Daftar Tenaga Ahli</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamMembers.filter(m => tenagaAhliRoles.includes(m.role)).length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Belum ada Tenaga Ahli</p>
                        <p className="text-sm">Klik "Tambah Tenaga Ahli" untuk menambahkan</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-700/30">
                            <TableHead className="text-gray-300">Image</TableHead>
                            <TableHead className="text-gray-300">Nama</TableHead>
                            <TableHead className="text-gray-300">Jabatan</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers
                            .filter(m => tenagaAhliRoles.includes(m.role))
                            .sort((a, b) => a.order - b.order)
                            .map((member) => (
                              <TableRow key={member.id} className="border-gray-700 hover:bg-gray-700/30">
                                <TableCell>
                                  {member.imageUrl ? (
                                    <img
                                      src={member.imageUrl}
                                      alt={member.name}
                                      className="w-12 h-12 object-cover rounded-full"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                                      <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="text-white font-medium">{member.name}</div>
                                  <div className="text-gray-400 text-sm">{member.email || '-'}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-gray-300">{member.titleIndo}</div>
                                  <div className="text-gray-400 text-sm">{member.titleEng}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={member.active}
                                      onCheckedChange={() => handleToggleTeamMemberActive(member.id, member.active)}
                                      className="data-[state=checked]:bg-green-500"
                                    />
                                    <span className={`text-sm ${member.active ? 'text-green-400' : 'text-gray-400'}`}>
                                      {member.active ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                      <DropdownMenuItem
                                        onClick={() => handleEditTeamMember(member)}
                                        className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteTeamMember(member.id)}
                                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Hapus
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Join Member Tab */}
          <TabsContent value="join-member" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Form Requirements</h2>
              <Dialog open={formRequirementDialogOpen} onOpenChange={setFormRequirementDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                    onClick={() => {
                      setEditingFormRequirement(null)
                      resetFormRequirementForm()
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Field
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingFormRequirement ? "Edit Form Field" : "Tambah Form Field Baru"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Konfigurasi field dalam form pendaftaran member
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field ID</Label>
                        <Input
                          value={formRequirementForm.fieldId}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, fieldId: e.target.value })}
                          placeholder="name, email, dll"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Profesi</Label>
                        <Select
                          value={formRequirementForm.profession}
                          onValueChange={(value) => setFormRequirementForm({ ...formRequirementForm, profession: value })}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="architect">Desain Arsitek</SelectItem>
                            <SelectItem value="licensed_architect">Arsitek Berlisensi</SelectItem>
                            <SelectItem value="structure">Desain Struktur</SelectItem>
                            <SelectItem value="mep">Desain MEP</SelectItem>
                            <SelectItem value="drafter">Drafter</SelectItem>
                            <SelectItem value="qs">QS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Field Type</Label>
                        <Select
                          value={formRequirementForm.fieldType}
                          onValueChange={(value) => setFormRequirementForm({ ...formRequirementForm, fieldType: value })}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {fieldTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Label (Indo)</Label>
                        <Input
                          value={formRequirementForm.labelIndo}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, labelIndo: e.target.value })}
                          placeholder="Label dalam bahasa Indonesia"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Label (Eng)</Label>
                        <Input
                          value={formRequirementForm.labelEng}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, labelEng: e.target.value })}
                          placeholder="Label in English"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Placeholder (Indo)</Label>
                        <Input
                          value={formRequirementForm.placeholderIndo}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, placeholderIndo: e.target.value })}
                          placeholder="Placeholder dalam bahasa Indonesia"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Placeholder (Eng)</Label>
                        <Input
                          value={formRequirementForm.placeholderEng}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, placeholderEng: e.target.value })}
                          placeholder="Placeholder in English"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                    </div>
                    {formRequirementForm.fieldType === 'select' && (
                      <div className="space-y-2">
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={formRequirementForm.options}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, options: e.target.value })}
                          placeholder="Option 1, Option 2, Option 3"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Required</Label>
                        <Select
                          value={formRequirementForm.required.toString()}
                          onValueChange={(value) => setFormRequirementForm({ ...formRequirementForm, required: value === "true" })}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="true">Wajib</SelectItem>
                            <SelectItem value="false">Opsional</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={formRequirementForm.order}
                          onChange={(e) => setFormRequirementForm({ ...formRequirementForm, order: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Active</Label>
                        <Select
                          value={formRequirementForm.active.toString()}
                          onValueChange={(value) => setFormRequirementForm({ ...formRequirementForm, active: value === "true" })}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setFormRequirementDialogOpen(false)
                          setEditingFormRequirement(null)
                          resetFormRequirementForm()
                        }}
                        className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Batal
                      </Button>
                      <Button
                        onClick={handleSaveFormRequirement}
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Profession Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormProfession('architect')}
                className={selectedFormProfession === 'architect'
                  ? "bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-transparent"
                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                Desain Arsitek
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormProfession('licensed_architect')}
                className={selectedFormProfession === 'licensed_architect'
                  ? "bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-transparent"
                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                Arsitek Berlisensi
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormProfession('structure')}
                className={selectedFormProfession === 'structure'
                  ? "bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-transparent"
                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                Desain Struktur
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormProfession('mep')}
                className={selectedFormProfession === 'mep'
                  ? "bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-transparent"
                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                Desain MEP
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormProfession('drafter')}
                className={selectedFormProfession === 'drafter'
                  ? "bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-transparent"
                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                Drafter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFormProfession('qs')}
                className={selectedFormProfession === 'qs'
                  ? "bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white border-transparent"
                  : "bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700"
                }
              >
                QS
              </Button>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Daftar Form Fields</CardTitle>
                <CardDescription className="text-gray-400">
                  Kelola field khusus untuk profesi {getProfessionLabel(selectedFormProfession)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableHead className="text-gray-300">Field ID</TableHead>
                      <TableHead className="text-gray-300">Profesi</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Label (Indo/Eng)</TableHead>
                      <TableHead className="text-gray-300">Required</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formRequirements
                      .filter(req => req.profession === selectedFormProfession)
                      .sort((a, b) => a.order - b.order)
                      .map((req) => (
                      <TableRow key={req.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-white font-medium">{req.fieldId}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500/20 text-blue-400">
                            {getProfessionLabel(req.profession!)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {req.fieldType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-gray-300">{req.labelIndo}</div>
                          <div className="text-gray-400 text-sm">{req.labelEng}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={req.required ? "default" : "secondary"} className={req.required ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}>
                            {req.required ? "Wajib" : "Opsional"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={req.active}
                                onCheckedChange={() => handleToggleFormRequirementActive(req.id, req.active)}
                                className="data-[state=checked]:bg-green-500"
                              />
                              <span className={`text-sm ${req.active ? 'text-green-400' : 'text-gray-400'}`}>
                                {req.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem
                                onClick={() => handleEditFormRequirement(req)}
                                className="text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteFormRequirement(req.id)}
                                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            {/* Contact Info Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Contact Info</h2>
                <Dialog open={contactInfoDialogOpen} onOpenChange={setContactInfoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingContactInfo(null)
                        resetContactInfoForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Contact Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContactInfo ? "Edit Contact Info" : "Tambah Contact Info Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select
                            value={contactInfoForm.type}
                            onValueChange={(value) => setContactInfoForm({ ...contactInfoForm, type: value })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {contactInfoTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Select
                            value={contactInfoForm.icon}
                            onValueChange={(value) => setContactInfoForm({ ...contactInfoForm, icon: value })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {iconOptions.map((icon) => (
                                <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label (Indo)</Label>
                          <Input
                            value={contactInfoForm.labelIndo}
                            onChange={(e) => setContactInfoForm({ ...contactInfoForm, labelIndo: e.target.value })}
                            placeholder="Label dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Label (Eng)</Label>
                          <Input
                            value={contactInfoForm.labelEng}
                            onChange={(e) => setContactInfoForm({ ...contactInfoForm, labelEng: e.target.value })}
                            placeholder="Label in English"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Value (Indo)</Label>
                          <Textarea
                            value={contactInfoForm.valueIndo}
                            onChange={(e) => setContactInfoForm({ ...contactInfoForm, valueIndo: e.target.value })}
                            placeholder="Nilai dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Value (Eng)</Label>
                          <Textarea
                            value={contactInfoForm.valueEng}
                            onChange={(e) => setContactInfoForm({ ...contactInfoForm, valueEng: e.target.value })}
                            placeholder="Value in English"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={contactInfoForm.order}
                            onChange={(e) => setContactInfoForm({ ...contactInfoForm, order: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={contactInfoForm.active.toString()}
                            onValueChange={(value) => setContactInfoForm({ ...contactInfoForm, active: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setContactInfoDialogOpen(false)
                            setEditingContactInfo(null)
                            resetContactInfoForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveContactInfo}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Contact Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/30">
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Label (Indo/Eng)</TableHead>
                        <TableHead className="text-gray-300">Value (Indo)</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactInfos.map((info) => (
                        <TableRow key={info.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {info.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-300">{info.labelIndo}</div>
                            <div className="text-gray-400 text-sm">{info.labelEng}</div>
                          </TableCell>
                          <TableCell className="text-gray-300 max-w-md truncate">{info.valueIndo}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={info.active}
                                onCheckedChange={() => handleToggleContactInfoActive(info.id, info.active)}
                                className="data-[state=checked]:bg-green-500"
                              />
                              <span className={`text-sm ${info.active ? 'text-green-400' : 'text-gray-400'}`}>
                                {info.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => handleEditContactInfo(info)}
                                  className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteContactInfo(info.id)}
                                  className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Operating Hours Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Jam Operasional</h2>
                <Dialog open={operatingHoursDialogOpen} onOpenChange={setOperatingHoursDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingOperatingHours(null)
                        resetOperatingHoursForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jam
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOperatingHours ? "Edit Jam Operasional" : "Tambah Jam Operasional Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Hari</Label>
                        <Select
                          value={operatingHoursForm.day}
                          onValueChange={(value) => {
                            const selectedDay = daysOfWeek.find(d => d.id === value)
                            if (selectedDay) {
                              setOperatingHoursForm({
                                ...operatingHoursForm,
                                day: value,
                                labelIndo: selectedDay.labelIndo,
                                labelEng: selectedDay.labelEng
                              })
                            }
                          }}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day.id} value={day.id}>{day.labelIndo}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Jam Buka</Label>
                          <Input
                            type="time"
                            value={operatingHoursForm.openTime}
                            onChange={(e) => setOperatingHoursForm({ ...operatingHoursForm, openTime: e.target.value })}
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Jam Tutup</Label>
                          <Input
                            type="time"
                            value={operatingHoursForm.closeTime}
                            onChange={(e) => setOperatingHoursForm({ ...operatingHoursForm, closeTime: e.target.value })}
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="closed"
                          checked={operatingHoursForm.closed}
                          onChange={(e) => setOperatingHoursForm({ ...operatingHoursForm, closed: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="closed" className="text-gray-300">Tutup</Label>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={operatingHoursForm.order}
                          onChange={(e) => setOperatingHoursForm({ ...operatingHoursForm, order: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOperatingHoursDialogOpen(false)
                            setEditingOperatingHours(null)
                            resetOperatingHoursForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveOperatingHours}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Jam Operasional</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/30">
                        <TableHead className="text-gray-300">Hari</TableHead>
                        <TableHead className="text-gray-300">Jam</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operatingHours.map((hours) => (
                        <TableRow key={hours.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell className="text-white font-medium">{hours.labelIndo}</TableCell>
                          <TableCell>
                            {hours.closed ? (
                              <Badge className="bg-red-500/20 text-red-400">Tutup</Badge>
                            ) : (
                              <span className="text-gray-300">{hours.openTime} - {hours.closeTime}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => handleEditOperatingHours(hours)}
                                  className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteOperatingHours(hours.id)}
                                  className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form Fields Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Contact Form Fields</h2>
                <Dialog open={contactFormFieldDialogOpen} onOpenChange={setContactFormFieldDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingContactFormField(null)
                        resetContactFormFieldForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Field
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingContactFormField ? "Edit Contact Form Field" : "Tambah Contact Form Field Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field ID</Label>
                          <Input
                            value={contactFormFieldForm.fieldId}
                            onChange={(e) => setContactFormFieldForm({ ...contactFormFieldForm, fieldId: e.target.value })}
                            placeholder="name, email, dll"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field Type</Label>
                          <Select
                            value={contactFormFieldForm.fieldType}
                            onValueChange={(value) => setContactFormFieldForm({ ...contactFormFieldForm, fieldType: value })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label (Indo)</Label>
                          <Input
                            value={contactFormFieldForm.labelIndo}
                            onChange={(e) => setContactFormFieldForm({ ...contactFormFieldForm, labelIndo: e.target.value })}
                            placeholder="Label dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Label (Eng)</Label>
                          <Input
                            value={contactFormFieldForm.labelEng}
                            onChange={(e) => setContactFormFieldForm({ ...contactFormFieldForm, labelEng: e.target.value })}
                            placeholder="Label in English"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Placeholder (Indo)</Label>
                          <Input
                            value={contactFormFieldForm.placeholderIndo}
                            onChange={(e) => setContactFormFieldForm({ ...contactFormFieldForm, placeholderIndo: e.target.value })}
                            placeholder="Placeholder dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Placeholder (Eng)</Label>
                          <Input
                            value={contactFormFieldForm.placeholderEng}
                            onChange={(e) => setContactFormFieldForm({ ...contactFormFieldForm, placeholderEng: e.target.value })}
                            placeholder="Placeholder in English"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Required</Label>
                          <Select
                            value={contactFormFieldForm.required.toString()}
                            onValueChange={(value) => setContactFormFieldForm({ ...contactFormFieldForm, required: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="true">Wajib</SelectItem>
                              <SelectItem value="false">Opsional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={contactFormFieldForm.order}
                            onChange={(e) => setContactFormFieldForm({ ...contactFormFieldForm, order: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Active</Label>
                          <Select
                            value={contactFormFieldForm.active.toString()}
                            onValueChange={(value) => setContactFormFieldForm({ ...contactFormFieldForm, active: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setContactFormFieldDialogOpen(false)
                            setEditingContactFormField(null)
                            resetContactFormFieldForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveContactFormField}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Contact Form Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700 hover:bg-gray-700/30">
                        <TableHead className="text-gray-300">Field ID</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">Label (Indo/Eng)</TableHead>
                        <TableHead className="text-gray-300">Required</TableHead>
                        <TableHead className="text-gray-300">Status</TableHead>
                        <TableHead className="text-gray-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactFormFields.map((field) => (
                        <TableRow key={field.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell className="text-white font-medium">{field.fieldId}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {field.fieldType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-300">{field.labelIndo}</div>
                            <div className="text-gray-400 text-sm">{field.labelEng}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={field.required ? "default" : "secondary"} className={field.required ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}>
                              {field.required ? "Wajib" : "Opsional"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.active}
                                onCheckedChange={() => handleToggleContactFormFieldActive(field.id, field.active)}
                                className="data-[state=checked]:bg-green-500"
                              />
                              <span className={`text-sm ${field.active ? 'text-green-400' : 'text-gray-400'}`}>
                                {field.active ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem
                                  onClick={() => handleEditContactFormField(field)}
                                  className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteContactFormField(field.id)}
                                  className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tenaga Ahli Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Tenaga Ahli</h2>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Daftar Tenaga Ahli</CardTitle>
                <CardDescription className="text-gray-400">
                  Kelola Founder, Leadership, dan Tenaga Ahli
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableHead className="text-gray-300">Nama</TableHead>
                      <TableHead className="text-gray-300">Jabatan</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Order</TableHead>
                      <TableHead className="text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member) => (
                      <TableRow key={member.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-white font-medium flex items-center gap-3">
                          {member.imageUrl && (
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"
                            />
                          )}
                          <span>{member.name}</span>
                        </TableCell>
                        <TableCell className="text-gray-300">{member.titleIndo}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(member.role)}>
                            {getRoleLabel(member.role)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{member.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={member.active}
                              onCheckedChange={() => handleToggleTeamMemberActive(member.id, member.active)}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <span className={`text-sm ${member.active ? 'text-green-400' : 'text-gray-400'}`}>
                              {member.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{member.order}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem
                                onClick={() => handleEditTeamMember(member)}
                                className="text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTeamMember(member.id)}
                                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Kategori Bangunan</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Daftar kategori bangunan yang ditampilkan di halaman Services
                </p>
              </div>
              <Button
                onClick={() => window.open('/services', '_blank')}
                className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Lihat Halaman Services
              </Button>
            </div>

            {/* Building Classes Section */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#E74C3C]" />
                  Kelas Teknis Bangunan (IAI)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Klasifikasi kelas teknis bangunan sesuai standar IAI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: '#6B5B95', backgroundColor: 'rgba(107, 91, 149, 0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-lg">K1</span>
                      <span className="text-gray-400 text-sm">Sederhana</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      Bangunan dengan desain standar dan teknologi konstruksi konvensional
                    </p>
                    <p className="text-gray-400 text-xs">
                      Luas terbatas, maksimal 2 lantai, bentang struktur pendek
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: '#9B59B6', backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-lg">K2</span>
                      <span className="text-gray-400 text-sm">Tidak Sederhana</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      Bangunan yang membutuhkan detail arsitektur khusus dan perhitungan struktur menengah
                    </p>
                    <p className="text-gray-400 text-xs">
                      Bertingkat sedang (3-8 lantai), menggunakan sistem MEP yang kompleks
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white text-lg">K3</span>
                      <span className="text-gray-400 text-sm">Khusus</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">
                      Bangunan dengan standar keamanan tinggi, teknologi mutakhir, atau bentuk ikonik
                    </p>
                    <p className="text-gray-400 text-xs">
                      Pencakar langit, bentang lebar (stadion), sistem proteksi radiasi/kimia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Building Scales Section */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#F39C12]" />
                  Klasifikasi Kepadatan Massa
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Klasifikasi bangunan berdasarkan jumlah lantai
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg border" style={{ borderColor: '#6B5B95', backgroundColor: 'rgba(107, 91, 149, 0.1)' }}>
                    <div className="font-bold text-white mb-1">Low-Rise</div>
                    <div className="text-[#6B5B95] text-sm mb-2">1-4 Lantai</div>
                    <p className="text-gray-400 text-xs">Rumah, Ruko, Gudang</p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ borderColor: '#9B59B6', backgroundColor: 'rgba(155, 89, 182, 0.1)' }}>
                    <div className="font-bold text-white mb-1">Mid-Rise</div>
                    <div className="text-[#9B59B6] text-sm mb-2">5-12 Lantai</div>
                    <p className="text-gray-400 text-xs">Apartemen Menengah, Kantor</p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ borderColor: '#E74C3C', backgroundColor: 'rgba(231, 76, 60, 0.1)' }}>
                    <div className="font-bold text-white mb-1">High-Rise</div>
                    <div className="text-[#E74C3C] text-sm mb-2">13-40 Lantai</div>
                    <p className="text-gray-400 text-xs">Hotel Mewah, Perkantoran Pusat</p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ borderColor: '#F39C12', backgroundColor: 'rgba(243, 156, 18, 0.1)' }}>
                    <div className="font-bold text-white mb-1">Super-Tall</div>
                    <div className="text-[#F39C12] text-sm mb-2">&gt;40 Lantai / &gt;300m</div>
                    <p className="text-gray-400 text-xs">Pencakar Langit Ikonik</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Section - Editable */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white">Kategori Layanan</CardTitle>
                    <CardDescription className="text-gray-400">
                      Kelola kategori bangunan yang ditampilkan di halaman Services
                    </CardDescription>
                  </div>
                  <Dialog open={serviceCategoryDialogOpen} onOpenChange={setServiceCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          resetServiceCategoryForm()
                          setEditingServiceCategory(null)
                        }}
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Kategori
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingServiceCategory ? 'Edit Kategori Layanan' : 'Tambah Kategori Layanan'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          {editingServiceCategory ? 'Edit informasi kategori layanan' : 'Tambah kategori layanan baru'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="categoryCode">Code</Label>
                            <Input
                              id="categoryCode"
                              value={serviceCategoryForm.code}
                              onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, code: e.target.value.toUpperCase() })}
                              placeholder="A, B, C, dll."
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="categoryIcon">Icon</Label>
                            <Select
                              value={serviceCategoryForm.icon}
                              onValueChange={(value) => setServiceCategoryForm({ ...serviceCategoryForm, icon: value })}
                            >
                              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                <SelectValue placeholder="Pilih Icon" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-700 border-gray-600 text-white">
                                {iconOptions.map((icon) => (
                                  <SelectItem key={icon} value={icon}>
                                    {icon}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="categoryNameIndo">Nama (Indo)</Label>
                          <Input
                            id="categoryNameIndo"
                            value={serviceCategoryForm.nameIndo}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, nameIndo: e.target.value })}
                            placeholder="Bangunan Hunian"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryNameEng">Name (Eng)</Label>
                          <Input
                            id="categoryNameEng"
                            value={serviceCategoryForm.nameEng}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, nameEng: e.target.value })}
                            placeholder="Residential Buildings"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDescIndo">Deskripsi (Indo)</Label>
                          <Textarea
                            id="categoryDescIndo"
                            value={serviceCategoryForm.descriptionIndo}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, descriptionIndo: e.target.value })}
                            placeholder="Deskripsi kategori..."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="categoryDescEng">Description (Eng)</Label>
                          <Textarea
                            id="categoryDescEng"
                            value={serviceCategoryForm.descriptionEng}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, descriptionEng: e.target.value })}
                            placeholder="Category description..."
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            id="categoryActive"
                            checked={serviceCategoryForm.active}
                            onCheckedChange={(checked) => setServiceCategoryForm({ ...serviceCategoryForm, active: checked })}
                          />
                          <Label htmlFor="categoryActive">Aktif</Label>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setServiceCategoryDialogOpen(false)
                            setEditingServiceCategory(null)
                            resetServiceCategoryForm()
                          }}
                          className="bg-gray-700 border-gray-600 text-white"
                        >
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveServiceCategory}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceCategories
                    .sort((a, b) => a.order - b.order)
                    .map((category, catIndex) => {
                      const IconComponent = category.icon ? iconMap[category.icon] : Home
                      const categoryColor = [
                        'rgba(107, 91, 149, 0.1)', // A - Purple
                        'rgba(155, 89, 182, 0.1)', // B - Light Purple
                        'rgba(231, 76, 60, 0.1)',  // C - Red
                        'rgba(243, 156, 18, 0.1)',  // D - Orange
                        'rgba(241, 196, 15, 0.1)',  // E - Yellow
                        'rgba(52, 152, 219, 0.1)'   // F - Blue
                      ][catIndex % 6]

                      const borderColor = [
                        '#6B5B95',
                        '#9B59B6',
                        '#E74C3C',
                        '#F39C12',
                        '#F1C40F',
                        '#3498DB'
                      ][catIndex % 6]

                      return (
                        <div
                          key={category.id}
                          className="border border-gray-700 rounded-lg p-4"
                          style={{ backgroundColor: categoryColor, borderColor: category.active ? borderColor : '#4B5563' }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {IconComponent && <IconComponent className={`w-8 h-8 ${category.active ? '' : 'opacity-50'}`} style={{ color: borderColor }} />}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className={`text-white font-bold text-lg ${!category.active ? 'opacity-50 line-through' : ''}`}>
                                  {category.code} - {category.nameIndo}
                                </h3>
                                {!category.active && <Badge variant="secondary" className="bg-gray-600">Non-Aktif</Badge>}
                              </div>
                              <p className={`text-gray-400 text-sm ${!category.active ? 'opacity-50' : ''}`}>{category.nameEng}</p>
                            </div>
                            <Badge className="ml-auto" style={{ backgroundColor: borderColor }}>
                              {category.subCategories?.length || 0} Sub-Kategori
                            </Badge>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveServiceCategory(category.id, 'up')}
                                disabled={catIndex === 0}
                                className="text-gray-400 hover:text-white"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMoveServiceCategory(category.id, 'down')}
                                disabled={catIndex === serviceCategories.length - 1}
                                className="text-gray-400 hover:text-white"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                  <DropdownMenuItem
                                    onClick={() => handleEditServiceCategory(category)}
                                    className="text-white hover:bg-gray-700 cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Kategori
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSubCategoryForm({ ...subCategoryForm, categoryId: category.id })
                                      setEditingSubCategory(null)
                                      setSubCategoryDialogOpen(true)
                                    }}
                                    className="text-white hover:bg-gray-700 cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Sub-Kategori
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleToggleServiceCategoryActive(category.id, category.active)}
                                    className="text-white hover:bg-gray-700 cursor-pointer"
                                  >
                                    {category.active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                                    {category.active ? 'Non-Aktifkan' : 'Aktifkan'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteServiceCategory(category.id)}
                                    className="text-red-400 hover:bg-gray-700 cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus Kategori
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          {category.descriptionIndo && (
                            <p className="text-gray-300 text-sm mb-3">{category.descriptionIndo}</p>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                            {category.subCategories
                              ?.sort((a, b) => a.order - b.order)
                              .map((subCat) => (
                                <div
                                  key={subCat.id}
                                  className="bg-gray-800/50 p-3 rounded border border-gray-700 relative group"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className={`font-semibold text-white ${!subCat.active ? 'opacity-50 line-through' : ''}`}>
                                      {subCat.code} - {subCat.nameIndo}
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100"
                                        >
                                          <MoreVertical className="w-3 h-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                        <DropdownMenuItem
                                          onClick={() => handleEditSubCategory(subCat)}
                                          className="text-white hover:bg-gray-700 cursor-pointer"
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSubCategoryForm({
                                              categoryId: subCat.categoryId,
                                              code: subCat.code,
                                              nameIndo: subCat.nameIndo,
                                              nameEng: subCat.nameEng,
                                              descriptionIndo: subCat.descriptionIndo || '',
                                              descriptionEng: subCat.descriptionEng || '',
                                              examplesIndo: subCat.examplesIndo || '',
                                              examplesEng: subCat.examplesEng || '',
                                              order: subCat.order,
                                              active: subCat.active
                                            })
                                            setEditingSubCategory(subCat)
                                            setSubCategoryDialogOpen(true)
                                          }}
                                          className="text-white hover:bg-gray-700 cursor-pointer"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          Duplikat
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleDeleteSubCategory(subCat.id)}
                                          className="text-red-400 hover:bg-gray-700 cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Hapus
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <p className={`text-gray-400 text-xs mt-1 ${!subCat.active ? 'opacity-50' : ''}`}>{subCat.nameEng}</p>
                                  {subCat.descriptionIndo && (
                                    <p className="text-gray-500 text-xs mt-1 line-clamp-2">{subCat.descriptionIndo}</p>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )
                    })}
                  {serviceCategories.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p>Belum ada kategori layanan. Klik "Tambah Kategori" untuk membuat baru.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Service Features Dialog */}
          <Dialog open={serviceFeaturesDialogOpen} onOpenChange={setServiceFeaturesDialogOpen}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  Kelola Fitur Layanan: {editingServiceFeatures?.titleIndo}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Tambah, edit, atau hapus fitur-fitur layanan ini
                </DialogDescription>
              </DialogHeader>
              {editingServiceFeatures && (
                <div className="space-y-4">
                  {/* Add Feature Form */}
                  <div className="p-4 bg-gray-700/50 rounded-lg space-y-3">
                    <h3 className="font-semibold text-white">Tambah Fitur Baru</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Fitur (Indo)</Label>
                        <Input
                          value={serviceFeatureForm.textIndo}
                          onChange={(e) => setServiceFeatureForm({ ...serviceFeatureForm, textIndo: e.target.value })}
                          placeholder="Desain Custom"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Feature (Eng)</Label>
                        <Input
                          value={serviceFeatureForm.textEng}
                          onChange={(e) => setServiceFeatureForm({ ...serviceFeatureForm, textEng: e.target.value })}
                          placeholder="Custom Design"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveServiceFeature}
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Fitur
                      </Button>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Daftar Fitur</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {editingServiceFeatures.features && editingServiceFeatures.features.length > 0 ? (
                        editingServiceFeatures.features.map((feature) => (
                          <div key={feature.id} className="p-3 bg-gray-700/30 rounded-lg space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="text-white font-medium">{feature.textIndo}</p>
                                <p className="text-gray-400 text-sm">{feature.textEng}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditServiceFeature(feature)}
                                  className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteServiceFeature(feature.id)}
                                  className="bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            {serviceFeatureForm.textIndo === feature.textIndo && (
                              <div className="flex gap-2 pt-2 border-t border-gray-700">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateServiceFeature(feature.id)}
                                  className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                >
                                  <Save className="w-4 h-4 mr-2" />
                                  Simpan Perubahan
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setServiceFeatureForm({ textIndo: "", textEng: "", order: 0 })}
                                  className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                                >
                                  Batal
                                </Button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-4">Belum ada fitur yang ditambahkan</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setServiceFeaturesDialogOpen(false)
                        setEditingServiceFeatures(null)
                        setServiceFeatureForm({ textIndo: "", textEng: "", order: 0 })
                      }}
                      className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Registered Members Tab */}
          <TabsContent value="registered-members" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-[#6B5B95]" />
                    Registered Members
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Kelola member yang mendaftar sendiri melalui form registrasi
                  </p>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 mb-6">
                <Select value={membersFilterStatus} onValueChange={setMembersFilterStatus}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={membersFilterProfession} onValueChange={setMembersFilterProfession}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Profesi" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">Semua Profesi</SelectItem>
                    <SelectItem value="architect">Arsitek</SelectItem>
                    <SelectItem value="licensed_architect">Arsitek Berlisensi</SelectItem>
                    <SelectItem value="structure">Struktur</SelectItem>
                    <SelectItem value="mep">MEP</SelectItem>
                    <SelectItem value="drafter">Drafter</SelectItem>
                    <SelectItem value="qs">Quantity Surveyor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Member Terdaftar</CardTitle>
                  <CardDescription className="text-gray-400">
                    {registeredMembers.length} member terdaftar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingMembers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9B59B6]"></div>
                    </div>
                  ) : registeredMembers.length === 0 ? (
                    <div className="text-center py-12">
                      <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                      <p className="text-gray-400">Belum ada member terdaftar</p>
                      <p className="text-sm text-gray-500 mt-1">Member yang mendaftar akan muncul di sini</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700 hover:bg-gray-700/30">
                          <TableHead className="text-gray-300">Member</TableHead>
                          <TableHead className="text-gray-300">Profesi</TableHead>
                          <TableHead className="text-gray-300">Rating</TableHead>
                          <TableHead className="text-gray-300">Proyek</TableHead>
                          <TableHead className="text-gray-300">Portfolio</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {registeredMembers.map((member) => (
                          <TableRow key={member.id} className="border-gray-700 hover:bg-gray-700/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-white font-medium">{member.name}</p>
                                  <p className="text-sm text-gray-500">{member.email}</p>
                                  {member.location && (
                                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                      <MapPin className="w-3 h-3" />
                                      {member.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                member.profession === 'licensed_architect' 
                                  ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              }>
                                {member.profession === 'licensed_architect' ? 'Arsitek Berlisensi' : member.profession}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {member.ratingCount > 0 ? (
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                  <span className="text-white font-medium">{member.rating}</span>
                                  <span className="text-xs text-gray-500">({member.ratingCount})</span>
                                </div>
                              ) : (
                                <span className="text-gray-500">Belum ada rating</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-white">
                                <p>{member.activeProjects} Aktif</p>
                                <p className="text-sm text-gray-500">{member.completedProjects} Selesai</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                member.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                member.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                member.status === 'suspended' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                member.status === 'rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                              }>
                                {member.status === 'active' ? 'Active' :
                                 member.status === 'pending' ? 'Pending' :
                                 member.status === 'suspended' ? 'Suspended' :
                                 member.status === 'rejected' ? 'Rejected' : member.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewRegisteredMember(member)}
                                  className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Detail
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteMemberClick(member)}
                                  className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Hapus
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pricing Rules Tab */}
          <TabsContent value="pricing-rules" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-6 h-6 text-[#6B5B95]" />
                    Pricing Rules
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Kelola harga IAI, persentase paket, dan harga per m²
                  </p>
                </div>
                <Dialog open={pricingRuleDialogOpen} onOpenChange={setPricingRuleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingPricingRule(null)
                        resetPricingRuleForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Pricing Rule Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPricingRule ? "Edit Pricing Rule" : "Tambah Pricing Rule Baru"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Atur harga dan fee untuk kategori bangunan tertentu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Building Type</Label>
                          <Select value={pricingRuleForm.buildingType} onValueChange={(value) => setPricingRuleForm({ ...pricingRuleForm, buildingType: value })}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="low-rise">Low-rise (≤ 4 lantai)</SelectItem>
                              <SelectItem value="mid-rise">Mid-rise (5-15 lantai)</SelectItem>
                              <SelectItem value="high-rise">High-rise (&gt; 15 lantai)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Quality Level</Label>
                          <Select value={pricingRuleForm.qualityLevel} onValueChange={(value) => setPricingRuleForm({ ...pricingRuleForm, qualityLevel: value })}>
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="sederhana">Sederhana</SelectItem>
                              <SelectItem value="menengah">Menengah</SelectItem>
                              <SelectItem value="mewah">Mewah</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Harga per m² (Rp)</Label>
                          <Input
                            type="number"
                            value={pricingRuleForm.pricePerM2}
                            onChange={(e) => setPricingRuleForm({ ...pricingRuleForm, pricePerM2: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>IAI Fee Rate (Decimal, contoh: 0.065 = 6.5%)</Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={pricingRuleForm.iaiFeeRate}
                            onChange={(e) => setPricingRuleForm({ ...pricingRuleForm, iaiFeeRate: parseFloat(e.target.value) || 0 })}
                            placeholder="0.065"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Min Floors</Label>
                          <Input
                            type="number"
                            value={pricingRuleForm.minFloors}
                            onChange={(e) => setPricingRuleForm({ ...pricingRuleForm, minFloors: parseInt(e.target.value) || 0 })}
                            placeholder="0"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Floors (Opsional)</Label>
                          <Input
                            type="number"
                            value={pricingRuleForm.maxFloors || ''}
                            onChange={(e) => setPricingRuleForm({ ...pricingRuleForm, maxFloors: e.target.value ? parseInt(e.target.value) : null })}
                            placeholder="Kosongkan jika tidak ada batas"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Deskripsi (Indo) - Opsional</Label>
                          <Textarea
                            value={pricingRuleForm.descriptionIndo}
                            onChange={(e) => setPricingRuleForm({ ...pricingRuleForm, descriptionIndo: e.target.value })}
                            placeholder="Deskripsi dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi (Eng) - Opsional</Label>
                          <Textarea
                            value={pricingRuleForm.descriptionEng}
                            onChange={(e) => setPricingRuleForm({ ...pricingRuleForm, descriptionEng: e.target.value })}
                            placeholder="Description in English"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={pricingRuleForm.active}
                          onCheckedChange={(checked) => setPricingRuleForm({ ...pricingRuleForm, active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPricingRuleDialogOpen(false)
                            setEditingPricingRule(null)
                            resetPricingRuleForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSavePricingRule}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Pricing Rules</CardTitle>
                  <CardDescription className="text-gray-400">
                    {pricingRules.length} pricing rules terdaftar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pricingRules.length === 0 ? (
                    <div className="text-center py-12">
                      <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                      <p className="text-gray-400">Belum ada pricing rules</p>
                      <p className="text-sm text-gray-500 mt-1">Tambahkan pricing rule untuk mengatur harga</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700 hover:bg-gray-700/30">
                          <TableHead className="text-gray-300">Building Type</TableHead>
                          <TableHead className="text-gray-300">Quality Level</TableHead>
                          <TableHead className="text-gray-300">Harga per m²</TableHead>
                          <TableHead className="text-gray-300">IAI Fee Rate</TableHead>
                          <TableHead className="text-gray-300">Lantai</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pricingRules.map((rule) => (
                          <TableRow key={rule.id} className="border-gray-700 hover:bg-gray-700/30">
                            <TableCell className="text-white font-medium">
                              {rule.buildingType === 'low-rise' ? 'Low-rise (≤ 4 lantai)' : 
                               rule.buildingType === 'mid-rise' ? 'Mid-rise (5-15 lantai)' : 
                               'High-rise (&gt; 15 lantai)'}
                            </TableCell>
                            <TableCell className="text-white">
                              {rule.qualityLevel === 'sederhana' ? 'Sederhana' : 
                               rule.qualityLevel === 'menengah' ? 'Menengah' : 'Mewah'}
                            </TableCell>
                            <TableCell className="text-white">
                              Rp {rule.pricePerM2.toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell className="text-white">
                              {(rule.iaiFeeRate * 100).toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {rule.minFloors}{rule.maxFloors ? ` - ${rule.maxFloors}` : '+'}
                            </TableCell>
                            <TableCell>
                              {rule.active ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                  <DropdownMenuItem
                                    onClick={() => handleEditPricingRule(rule)}
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleTogglePricingRuleActive(rule.id, rule.active)}
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                  >
                                    {rule.active ? (
                                      <><XCircle className="w-4 h-4 mr-2" />Nonaktifkan</>
                                    ) : (
                                      <><CheckCircle className="w-4 h-4 mr-2" />Aktifkan</>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePricingRule(rule.id)}
                                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Pricing Tab */}
          <TabsContent value="service-pricing" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#6B5B95]" />
                    Konfigurasi Layanan
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Kelola harga layanan dan biaya minimum untuk setiap jenis layanan
                  </p>
                </div>
                <Dialog open={serviceConfigDialogOpen} onOpenChange={setServiceConfigDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingServiceConfig(null)
                        resetServiceConfigForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Layanan
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingServiceConfig ? "Edit Layanan" : "Tambah Layanan Baru"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Atur konfigurasi harga layanan dalam bahasa Indonesia dan Inggris
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Service Key *</Label>
                        <Input
                          value={serviceConfigForm.serviceKey}
                          onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, serviceKey: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                          placeholder="contoh: architectural_design"
                          className="bg-gray-700/50 border-gray-600"
                          disabled={!!editingServiceConfig}
                        />
                        <p className="text-xs text-gray-500">Kunci unik untuk layanan (hanya huruf, angka, dan underscore)</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nama Layanan (Indo) *</Label>
                          <Input
                            value={serviceConfigForm.labelIndo}
                            onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, labelIndo: e.target.value })}
                            placeholder="Desain Arsitek"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Service Name (Eng) *</Label>
                          <Input
                            value={serviceConfigForm.labelEng}
                            onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, labelEng: e.target.value })}
                            placeholder="Architectural Design"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Select value={serviceConfigForm.icon} onValueChange={(value) => setServiceConfigForm({ ...serviceConfigForm, icon: value })}>
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            {iconOptions.map((icon) => (
                              <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Rate (%) dari RAB *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={(serviceConfigForm.rate * 100).toFixed(2)}
                            onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, rate: parseFloat(e.target.value) / 100 || 0 })}
                            placeholder="10.00"
                            className="bg-gray-700/50 border-gray-600"
                          />
                          <p className="text-xs text-gray-500">Persentase fee dari RAB (0-100%)</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Minimum Fee (IDR) *</Label>
                          <Input
                            type="number"
                            step="100000"
                            min="0"
                            value={serviceConfigForm.minFee}
                            onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, minFee: parseFloat(e.target.value) || 0 })}
                            placeholder="5000000"
                            className="bg-gray-700/50 border-gray-600"
                          />
                          <p className="text-xs text-gray-500">Biaya minimum dalam Rupiah</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Deskripsi (Indo)</Label>
                          <Textarea
                            value={serviceConfigForm.descriptionIndo}
                            onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, descriptionIndo: e.target.value })}
                            placeholder="Deskripsi layanan dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (Eng)</Label>
                          <Textarea
                            value={serviceConfigForm.descriptionEng}
                            onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, descriptionEng: e.target.value })}
                            placeholder="Service description in English"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Urutan</Label>
                        <Input
                          type="number"
                          min="0"
                          value={serviceConfigForm.order}
                          onChange={(e) => setServiceConfigForm({ ...serviceConfigForm, order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="bg-gray-700/50 border-gray-600"
                        />
                        <p className="text-xs text-gray-500">Semakin kecil angka, semakin ke atas posisinya</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={serviceConfigForm.active}
                          onCheckedChange={(checked) => setServiceConfigForm({ ...serviceConfigForm, active: checked })}
                        />
                        <Label>Active</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setServiceConfigDialogOpen(false)
                            setEditingServiceConfig(null)
                            resetServiceConfigForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveServiceConfig}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Layanan</CardTitle>
                  <CardDescription className="text-gray-400">
                    {serviceConfigs.length} layanan terdaftar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {serviceConfigs.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                      <p className="text-gray-400">Belum ada layanan</p>
                      <p className="text-sm text-gray-500 mt-1">Tambahkan layanan untuk mengatur harga</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-700/30">
                            <TableHead className="text-gray-300 w-12">#</TableHead>
                            <TableHead className="text-gray-300">Layanan</TableHead>
                            <TableHead className="text-gray-300">Rate</TableHead>
                            <TableHead className="text-gray-300">Minimum Fee</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceConfigs.map((config, index) => (
                            <TableRow key={config.id} className="border-gray-700 hover:bg-gray-700/30">
                              <TableCell className="text-gray-400">{index + 1}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-lg flex items-center justify-center">
                                    {config.icon && (() => {
                                      const IconComponent = iconMap[config.icon] || Building2
                                      return IconComponent ? <IconComponent className="w-5 h-5 text-white" /> : null
                                    })()}
                                  </div>
                                  <div>
                                    <p className="text-white font-medium">{config.labelIndo}</p>
                                    <p className="text-sm text-gray-500">{config.labelEng}</p>
                                    {config.serviceKey && (
                                      <p className="text-xs text-gray-600 mt-1">Key: {config.serviceKey}</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-white">
                                <span className="text-lg font-semibold text-[#9B59B6]">
                                  {(config.rate * 100).toFixed(2)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-white">
                                <span className="font-semibold">
                                  Rp {config.minFee.toLocaleString('id-ID')}
                                </span>
                              </TableCell>
                              <TableCell>
                                {config.active ? (
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                                ) : (
                                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleMoveServiceConfig(config.id, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30"
                                    title="Geser ke atas"
                                  >
                                    <span className="text-lg">↑</span>
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleMoveServiceConfig(config.id, 'down')}
                                    disabled={index === serviceConfigs.length - 1}
                                    className="text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30"
                                    title="Geser ke bawah"
                                  >
                                    <span className="text-lg">↓</span>
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleToggleServiceConfigActive(config.id, config.active)}
                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                    title={config.active ? "Nonaktifkan" : "Aktifkan"}
                                  >
                                    {config.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEditServiceConfig(config)}
                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDeleteServiceConfig(config.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                    title="Hapus"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Order Service Fields Tab */}
          <TabsContent value="order-service-fields" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <FileText className="w-6 h-6 text-[#6B5B95]" />
                    Pengelolaan Form Fields
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Kelola field yang akan muncul pada form pemesanan layanan
                  </p>
                </div>
                <Dialog open={orderServiceFieldDialogOpen} onOpenChange={setOrderServiceFieldDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingOrderServiceField(null)
                        resetOrderServiceFieldForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Field Baru
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOrderServiceField ? "Edit Form Field" : "Tambah Form Field Baru"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Atur field untuk form pemesanan layanan
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Field Key *</Label>
                          <Input
                            value={orderServiceFieldForm.fieldKey}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, fieldKey: e.target.value })}
                            placeholder="location, landArea, dll"
                            className="bg-gray-700/50 border-gray-600"
                          />
                          <p className="text-xs text-gray-500">Kunci unik untuk field ini</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Field Type *</Label>
                          <Select
                            value={orderServiceFieldForm.fieldType}
                            onValueChange={(value) => setOrderServiceFieldForm({ ...orderServiceFieldForm, fieldType: value })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {fieldTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Label (Indonesia) *</Label>
                          <Input
                            value={orderServiceFieldForm.labelIndo}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, labelIndo: e.target.value })}
                            placeholder="Label dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Label (English) *</Label>
                          <Input
                            value={orderServiceFieldForm.labelEng}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, labelEng: e.target.value })}
                            placeholder="Label in English"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Placeholder (Indonesia)</Label>
                          <Input
                            value={orderServiceFieldForm.placeholderIndo}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, placeholderIndo: e.target.value })}
                            placeholder="Placeholder dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Placeholder (English)</Label>
                          <Input
                            value={orderServiceFieldForm.placeholderEng}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, placeholderEng: e.target.value })}
                            placeholder="Placeholder in English"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      {orderServiceFieldForm.fieldType === 'select' && (
                        <div className="space-y-2">
                          <Label>Options (JSON Format) *</Label>
                          <Textarea
                            value={orderServiceFieldForm.options}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, options: e.target.value })}
                            placeholder='[{"value": "option1", "label": "Pilihan 1"}, {"value": "option2", "label": "Pilihan 2"}]'
                            className="bg-gray-700/50 border-gray-600 min-h-[100px] font-mono text-sm"
                          />
                          <p className="text-xs text-gray-500">Format: Array of objects dengan value dan label</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Validation Rules (JSON Format, Opsional)</Label>
                        <Textarea
                          value={orderServiceFieldForm.validation}
                          onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, validation: e.target.value })}
                          placeholder='{"min": 0, "max": 100, "pattern": "^[a-zA-Z]+$"}'
                          className="bg-gray-700/50 border-gray-600 min-h-[80px] font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">Aturan validasi tambahan dalam format JSON</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Required</Label>
                          <Select
                            value={orderServiceFieldForm.required.toString()}
                            onValueChange={(value) => setOrderServiceFieldForm({ ...orderServiceFieldForm, required: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="true">Wajib</SelectItem>
                              <SelectItem value="false">Opsional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={orderServiceFieldForm.order}
                            onChange={(e) => setOrderServiceFieldForm({ ...orderServiceFieldForm, order: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700/50 border-gray-600"
                          />
                          <p className="text-xs text-gray-500">Urutan tampilan</p>
                        </div>
                        <div className="space-y-2">
                          <Label>Active</Label>
                          <Select
                            value={orderServiceFieldForm.active.toString()}
                            onValueChange={(value) => setOrderServiceFieldForm({ ...orderServiceFieldForm, active: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setOrderServiceFieldDialogOpen(false)
                            setEditingOrderServiceField(null)
                            resetOrderServiceFieldForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveOrderServiceField}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Form Fields</CardTitle>
                  <CardDescription className="text-gray-400">
                    {orderServiceFields.length} form fields terdaftar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {orderServiceFields.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500 opacity-50" />
                      <p className="text-gray-400">Belum ada form fields</p>
                      <p className="text-sm text-gray-500 mt-1">Tambahkan field untuk form pemesanan layanan</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-700/30">
                            <TableHead className="text-gray-300">Order</TableHead>
                            <TableHead className="text-gray-300">Field Key</TableHead>
                            <TableHead className="text-gray-300">Type</TableHead>
                            <TableHead className="text-gray-300">Label (Indo/Eng)</TableHead>
                            <TableHead className="text-gray-300">Required</TableHead>
                            <TableHead className="text-gray-300">Options</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300 text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderServiceFields
                            .sort((a, b) => a.order - b.order)
                            .map((field) => (
                            <TableRow key={field.id} className="border-gray-700 hover:bg-gray-700/30">
                              <TableCell className="text-gray-300 font-medium">{field.order}</TableCell>
                              <TableCell className="text-white font-medium">
                                <code className="bg-gray-700/50 px-2 py-1 rounded text-sm">{field.fieldKey}</code>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="border-gray-600 text-gray-300">
                                  {field.fieldType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-gray-300">{field.labelIndo}</div>
                                <div className="text-gray-500 text-sm">{field.labelEng}</div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={field.required ? "default" : "secondary"} className={field.required ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}>
                                  {field.required ? "Wajib" : "Opsional"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {field.fieldType === 'select' && field.options ? (
                                  <div className="text-xs text-gray-400 max-w-[200px] truncate">
                                    {(() => {
                                      try {
                                        const opts = JSON.parse(field.options)
                                        return `${opts.length} pilihan`
                                      } catch {
                                        return 'Invalid JSON'
                                      }
                                    })()}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {field.active ? (
                                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">
                                    <Check className="w-3 h-3 mr-1" />Active
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
                                    <X className="w-3 h-3 mr-1" />Inactive
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                                    <DropdownMenuItem
                                      onClick={() => handleEditOrderServiceField(field)}
                                      className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                    >
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        const newActive = !field.active
                                        setEditingOrderServiceField(field)
                                        setOrderServiceFieldForm({
                                          fieldKey: field.fieldKey,
                                          labelIndo: field.labelIndo,
                                          labelEng: field.labelEng,
                                          fieldType: field.fieldType,
                                          required: field.required,
                                          placeholderIndo: field.placeholderIndo || '',
                                          placeholderEng: field.placeholderEng || '',
                                          options: field.options || '',
                                          validation: field.validation || '',
                                          order: field.order,
                                          active: newActive
                                        })
                                        handleSaveOrderServiceField()
                                      }}
                                      className="text-gray-300 hover:bg-gray-700 hover:text-white"
                                    >
                                      {field.active ? (
                                        <><XCircle className="w-4 h-4 mr-2" />Nonaktifkan</>
                                      ) : (
                                        <><CheckCircle className="w-4 h-4 mr-2" />Aktifkan</>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteOrderServiceField(field.id)}
                                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Service Categories Tab */}
          <TabsContent value="service-categories" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Kategori Layanan</h2>
                  <p className="text-sm text-gray-400">Kelola kategori untuk halaman Services</p>
                </div>
                <Dialog open={serviceCategoryDialogOpen} onOpenChange={setServiceCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      onClick={() => {
                        setEditingServiceCategory(null)
                        resetServiceCategoryForm()
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingServiceCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Isi detail kategori layanan dalam bahasa Indonesia dan Inggris
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                          value={serviceCategoryForm.code}
                          onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, code: e.target.value })}
                          placeholder="A, B, C, D, E, F"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nama (Indo)</Label>
                          <Input
                            value={serviceCategoryForm.nameIndo}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, nameIndo: e.target.value })}
                            placeholder="Bangunan Hunian"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Name (Eng)</Label>
                          <Input
                            value={serviceCategoryForm.nameEng}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, nameEng: e.target.value })}
                            placeholder="Residential Buildings"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Deskripsi (Indo)</Label>
                          <Textarea
                            value={serviceCategoryForm.descriptionIndo}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, descriptionIndo: e.target.value })}
                            placeholder="Deskripsi dalam bahasa Indonesia"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Deskripsi (Eng)</Label>
                          <Textarea
                            value={serviceCategoryForm.descriptionEng}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, descriptionEng: e.target.value })}
                            placeholder="Description in English"
                            className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Select
                            value={serviceCategoryForm.icon}
                            onValueChange={(value) => setServiceCategoryForm({ ...serviceCategoryForm, icon: value })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {iconOptions.map((icon) => (
                                <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={serviceCategoryForm.order}
                            onChange={(e) => setServiceCategoryForm({ ...serviceCategoryForm, order: parseInt(e.target.value) || 0 })}
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={serviceCategoryForm.active.toString()}
                            onValueChange={(value) => setServiceCategoryForm({ ...serviceCategoryForm, active: value === "true" })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setServiceCategoryDialogOpen(false)
                            setEditingServiceCategory(null)
                            resetServiceCategoryForm()
                          }}
                          className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Batal
                        </Button>
                        <Button
                          onClick={handleSaveServiceCategory}
                          className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Kategori Layanan</CardTitle>
                </CardHeader>
                <CardContent>
                  {serviceCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Home className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Belum ada kategori layanan</p>
                      <p className="text-sm">Klik "Tambah Kategori" untuk menambahkan</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-700/30">
                            <TableHead className="text-gray-300 w-16">#</TableHead>
                            <TableHead className="text-gray-300">Code</TableHead>
                            <TableHead className="text-gray-300">Icon</TableHead>
                            <TableHead className="text-gray-300">Nama</TableHead>
                            <TableHead className="text-gray-300">Deskripsi</TableHead>
                            <TableHead className="text-gray-300 w-20">Sub</TableHead>
                            <TableHead className="text-gray-300 w-16">Order</TableHead>
                            <TableHead className="text-gray-300 w-24">Status</TableHead>
                            <TableHead className="text-gray-300 text-right w-40">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceCategories
                            .sort((a, b) => a.order - b.order)
                            .map((category, index) => {
                              const IconComponent = iconMap[category.icon || 'Home'] || Home
                              return (
                                <TableRow key={category.id} className="border-gray-700 hover:bg-gray-700/30">
                                  <TableCell className="text-white font-medium">{category.order}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="border-gray-600 text-gray-300">{category.code}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="bg-gradient-to-br from-[#6B5B95] to-[#8B7AB8] p-2 rounded-lg inline-flex">
                                      <IconComponent className="w-5 h-5 text-white" />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-white font-medium">{category.nameIndo}</div>
                                    <div className="text-gray-400 text-sm">{category.nameEng}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-gray-300 max-w-xs truncate text-sm">{category.descriptionIndo}</div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className="bg-blue-500/20 text-blue-400">{category.subCategories?.length || 0}</Badge>
                                  </TableCell>
                                  <TableCell className="text-gray-300">{category.order}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Switch
                                        checked={category.active}
                                        onCheckedChange={() => handleToggleServiceCategoryActive(category.id, category.active)}
                                        className="data-[state=checked]:bg-green-500"
                                      />
                                      <span className={`text-sm ${category.active ? 'text-green-400' : 'text-gray-400'}`}>
                                        {category.active ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMoveServiceCategory(category.id, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-white"
                                      >
                                        <ChevronUp className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleMoveServiceCategory(category.id, 'down')}
                                        disabled={index === serviceCategories.length - 1}
                                        className="text-gray-400 hover:text-white"
                                      >
                                        <ChevronDown className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEditServiceCategory(category)}
                                        className="text-gray-400 hover:text-white"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteServiceCategory(category.id)}
                                        className="text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sub Categories Tab */}
          <TabsContent value="sub-categories" className="space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Sub Kategori</h2>
                  <p className="text-sm text-gray-400">Kelola sub-kategori untuk setiap kategori layanan</p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedCategoryFilter}
                    onValueChange={setSelectedCategoryFilter}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 w-48">
                      <SelectValue placeholder="Filter Kategori" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {serviceCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.code} - {category.nameIndo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={subCategoryDialogOpen} onOpenChange={setSubCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                        onClick={() => {
                          setEditingSubCategory(null)
                          resetSubCategoryForm()
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Sub Kategori
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {editingSubCategory ? "Edit Sub Kategori" : "Tambah Sub Kategori Baru"}
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Isi detail sub-kategori layanan dalam bahasa Indonesia dan Inggris
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Kategori</Label>
                          <Select
                            value={subCategoryForm.categoryId}
                            onValueChange={(value) => setSubCategoryForm({ ...subCategoryForm, categoryId: value })}
                          >
                            <SelectTrigger className="bg-gray-700/50 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {serviceCategories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.code} - {category.nameIndo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Code</Label>
                          <Input
                            value={subCategoryForm.code}
                            onChange={(e) => setSubCategoryForm({ ...subCategoryForm, code: e.target.value })}
                            placeholder="A1, A2, B1, dll"
                            className="bg-gray-700/50 border-gray-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nama (Indo)</Label>
                            <Input
                              value={subCategoryForm.nameIndo}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, nameIndo: e.target.value })}
                              placeholder="Hunian Tunggal"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Name (Eng)</Label>
                            <Input
                              value={subCategoryForm.nameEng}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, nameEng: e.target.value })}
                              placeholder="Single-Family Housing"
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Deskripsi (Indo)</Label>
                            <Textarea
                              value={subCategoryForm.descriptionIndo}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, descriptionIndo: e.target.value })}
                              placeholder="Deskripsi dalam bahasa Indonesia"
                              className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Deskripsi (Eng)</Label>
                            <Textarea
                              value={subCategoryForm.descriptionEng}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, descriptionEng: e.target.value })}
                              placeholder="Description in English"
                              className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Examples (Indo) - JSON Array</Label>
                            <Textarea
                              value={subCategoryForm.examplesIndo}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, examplesIndo: e.target.value })}
                              placeholder='["Rumah Tipe 36-45", "Villa"]'
                              className="bg-gray-700/50 border-gray-600 min-h-[80px] font-mono text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Examples (Eng) - JSON Array</Label>
                            <Textarea
                              value={subCategoryForm.examplesEng}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, examplesEng: e.target.value })}
                              placeholder='["Type 36-45 House", "Villa"]'
                              className="bg-gray-700/50 border-gray-600 min-h-[80px] font-mono text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Order</Label>
                            <Input
                              type="number"
                              value={subCategoryForm.order}
                              onChange={(e) => setSubCategoryForm({ ...subCategoryForm, order: parseInt(e.target.value) || 0 })}
                              className="bg-gray-700/50 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                              value={subCategoryForm.active.toString()}
                              onValueChange={(value) => setSubCategoryForm({ ...subCategoryForm, active: value === "true" })}
                            >
                              <SelectTrigger className="bg-gray-700/50 border-gray-600">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-800 border-gray-700">
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSubCategoryDialogOpen(false)
                              setEditingSubCategory(null)
                              resetSubCategoryForm()
                            }}
                            className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Batal
                          </Button>
                          <Button
                            onClick={handleSaveSubCategory}
                            className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Simpan
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Daftar Sub Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  {subCategories.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Belum ada sub-kategori</p>
                      <p className="text-sm">Klik "Tambah Sub Kategori" untuk menambahkan</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-700/30">
                            <TableHead className="text-gray-300">Kategori</TableHead>
                            <TableHead className="text-gray-300">Code</TableHead>
                            <TableHead className="text-gray-300">Nama</TableHead>
                            <TableHead className="text-gray-300">Deskripsi</TableHead>
                            <TableHead className="text-gray-300">Examples</TableHead>
                            <TableHead className="text-gray-300 w-16">Order</TableHead>
                            <TableHead className="text-gray-300 w-24">Status</TableHead>
                            <TableHead className="text-gray-300 text-right w-32">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subCategories
                            .sort((a, b) => a.order - b.order)
                            .map((subCategory) => (
                              <TableRow key={subCategory.id} className="border-gray-700 hover:bg-gray-700/30">
                                <TableCell>
                                  <div className="text-white font-medium">{subCategory.category?.nameIndo || '-'}</div>
                                  <div className="text-gray-400 text-sm">{subCategory.category?.nameEng || ''}</div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-gray-600 text-gray-300">{subCategory.code}</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-white">{subCategory.nameIndo}</div>
                                  <div className="text-gray-400 text-sm">{subCategory.nameEng}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-gray-300 max-w-xs truncate text-sm">{subCategory.descriptionIndo}</div>
                                </TableCell>
                                <TableCell>
                                  {subCategory.examplesIndo ? (
                                    <div className="flex flex-wrap gap-1">
                                      {JSON.parse(subCategory.examplesIndo).slice(0, 3).map((example: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                          {example}
                                        </Badge>
                                      ))}
                                      {JSON.parse(subCategory.examplesIndo).length > 3 && (
                                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                                          +{JSON.parse(subCategory.examplesIndo).length - 3}
                                        </Badge>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-gray-300">{subCategory.order}</TableCell>
                                <TableCell>
                                  <Badge className={subCategory.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                                    {subCategory.active ? "Active" : "Inactive"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEditSubCategory(subCategory)}
                                      className="text-gray-400 hover:text-white"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteSubCategory(subCategory.id)}
                                      className="text-red-400 hover:text-red-300"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Portfolio</h2>
              <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                    onClick={() => {
                      setEditingProject(null)
                      resetProjectForm()
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProject ? "Edit Project" : "Tambah Project Baru"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Isi detail project dalam bahasa Indonesia dan Inggris
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title (Indo)</Label>
                        <Input
                          value={projectForm.titleIndo}
                          onChange={(e) => setProjectForm({ ...projectForm, titleIndo: e.target.value })}
                          placeholder="Judul project"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Title (Eng)</Label>
                        <Input
                          value={projectForm.titleEng}
                          onChange={(e) => setProjectForm({ ...projectForm, titleEng: e.target.value })}
                          placeholder="Project title"
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description (Indo)</Label>
                        <Textarea
                          value={projectForm.descriptionIndo}
                          onChange={(e) => setProjectForm({ ...projectForm, descriptionIndo: e.target.value })}
                          placeholder="Deskripsi dalam bahasa Indonesia"
                          className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description (Eng)</Label>
                        <Textarea
                          value={projectForm.descriptionEng}
                          onChange={(e) => setProjectForm({ ...projectForm, descriptionEng: e.target.value })}
                          placeholder="Description in English"
                          className="bg-gray-700/50 border-gray-600 min-h-[80px]"
                        />
                      </div>
                    </div>
                    {/* Image Upload Section */}
                    <div className="space-y-2">
                      <Label>Foto Project (Maksimal 5MB, Format: JPEG, PNG, GIF, WebP, SVG)</Label>
                      <div className="space-y-3">
                        {projectForm.imageUrl && (
                          <div className="relative w-full max-w-md">
                            <img
                              src={projectForm.imageUrl}
                              alt="Project Preview"
                              className="w-full h-48 object-cover rounded-lg border-2 border-gray-600"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file && editingProject) {
                                  handleUploadProjectImage(editingProject.id, file)
                                }
                              }}
                              disabled={!editingProject || uploadingImage}
                              className="bg-gray-700/50 border-gray-600"
                            />
                            {uploadingImage && (
                              <span className="text-sm text-gray-400">Uploading...</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Label className="text-xs text-gray-400">Atau masukkan URL gambar:</Label>
                              <Input
                                type="text"
                                value={projectForm.imageUrl}
                                onChange={(e) => setProjectForm({ ...projectForm, imageUrl: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="bg-gray-700/50 border-gray-600 text-sm mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                          value={projectForm.category}
                          onValueChange={(value) => setProjectForm({ ...projectForm, category: value })}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="residential">Residential</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="interior">Interior</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={projectForm.order}
                          onChange={(e) => setProjectForm({ ...projectForm, order: parseInt(e.target.value) || 0 })}
                          className="bg-gray-700/50 border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={projectForm.active.toString()}
                          onValueChange={(value) => setProjectForm({ ...projectForm, active: value === "true" })}
                        >
                          <SelectTrigger className="bg-gray-700/50 border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setProjectDialogOpen(false)
                          setEditingProject(null)
                          resetProjectForm()
                        }}
                        className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Batal
                      </Button>
                      <Button
                        onClick={handleSaveProject}
                        className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Simpan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Daftar Projects</CardTitle>
                <CardDescription className="text-gray-400">
                  Kelola portfolio projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/30">
                      <TableHead className="text-gray-300">Order</TableHead>
                      <TableHead className="text-gray-300">Image</TableHead>
                      <TableHead className="text-gray-300">Title (Indo/Eng)</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-gray-300">{project.order}</TableCell>
                        <TableCell>
                          {project.imageUrl && (
                            <img
                              src={project.imageUrl}
                              alt={project.titleIndo}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-white font-medium">{project.titleIndo}</div>
                          <div className="text-gray-400 text-sm">{project.titleEng}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {project.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={project.active ? "default" : "secondary"} className={project.active ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-gray-500/20 text-gray-400"}>
                            {project.active ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                            {project.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem
                                onClick={() => handleEditProject(project)}
                                className="text-gray-300 hover:bg-gray-700 hover:text-white"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Home Stats Tab */}
          <TabsContent value="home-stats" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Kelola Statistik Home</h2>
            </div>
            
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Statistik yang Tampil di Halaman Utama</CardTitle>
                <CardDescription className="text-gray-400">
                  Atur statistik yang ditampilkan di halaman home seperti jumlah proyek, member, dll.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-[#6B5B95]" />
                  <h3 className="text-xl font-bold text-white mb-2">Manajemen Home Stats</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Buka halaman khusus untuk menambah, mengedit, atau menonaktifkan statistik yang tampil di halaman utama
                  </p>
                  <Button
                    onClick={() => router.push('/admin/home-stats')}
                    className="bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Buka Halaman Kelola Statistik
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registered Member Detail Dialog */}
          <Dialog open={registeredMembersDialogOpen} onOpenChange={setRegisteredMembersDialogOpen}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Detail Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Informasi lengkap member terdaftar
                </DialogDescription>
              </DialogHeader>
              {viewingRegisteredMember && (
                <div className="space-y-6 mt-4">
                  {/* Profile Section */}
                  <div className="flex items-start gap-4 p-4 bg-gray-700/30 rounded-lg">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{viewingRegisteredMember.name}</h3>
                      <p className="text-gray-400">{viewingRegisteredMember.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Joined: {new Date(viewingRegisteredMember.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Informasi Kontak</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-[#9B59B6]" />
                          <span className="text-white">{viewingRegisteredMember.phone}</span>
                        </div>
                        {viewingRegisteredMember.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#E74C3C]" />
                            <span className="text-white">{viewingRegisteredMember.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Profesi & Pengalaman</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#F39C12]" />
                          <span className="text-white">{viewingRegisteredMember.profession}</span>
                        </div>
                        {viewingRegisteredMember.experience && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#6B5B95]" />
                            <span className="text-white">{viewingRegisteredMember.experience} years</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {viewingRegisteredMember.bio && (
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Bio</p>
                      <p className="text-white">{viewingRegisteredMember.bio}</p>
                    </div>
                  )}

                  {/* Expertise */}
                  {viewingRegisteredMember.expertise && viewingRegisteredMember.expertise.length > 0 && (
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 mb-3">Keahlian</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingRegisteredMember.expertise.map((exp: string, idx: number) => (
                          <Badge key={idx} className="bg-[#6B5B95]/20 text-[#9B59B6] border-[#6B5B95]/30">
                            {exp}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Building Types (for Licensed Architects) */}
                  {viewingRegisteredMember.profession === 'licensed_architect' && viewingRegisteredMember.buildingTypes && viewingRegisteredMember.buildingTypes.length > 0 && (
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                      <p className="text-sm text-gray-500 mb-3">Tipe Bangunan Berlisensi</p>
                      <div className="flex flex-wrap gap-2">
                        {viewingRegisteredMember.buildingTypes.map((type: string, idx: number) => (
                          <Badge key={idx} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-700/30 rounded-lg text-center">
                      <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{viewingRegisteredMember.rating}</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg text-center">
                      <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{viewingRegisteredMember.ratingCount}</p>
                      <p className="text-xs text-gray-500">Reviews</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg text-center">
                      <FileText className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{viewingRegisteredMember.portfolioProjects}</p>
                      <p className="text-xs text-gray-500">Portfolio</p>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg text-center">
                      <Award className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{viewingRegisteredMember.certificates}</p>
                      <p className="text-xs text-gray-500">Sertifikat</p>
                    </div>
                  </div>

                  {/* Projects Stats */}
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-sm text-gray-500 mb-3">Statistik Proyek</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{viewingRegisteredMember.activeProjects}</p>
                        <p className="text-xs text-gray-500">Proyek Aktif</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{viewingRegisteredMember.completedProjects}</p>
                        <p className="text-xs text-gray-500">Selesai</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-300">{viewingRegisteredMember.totalProjects}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setRegisteredMembersDialogOpen(false)}
                      className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Member Confirmation Dialog */}
          <Dialog open={deleteMemberDialogOpen} onOpenChange={setDeleteMemberDialogOpen}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-red-400">Konfirmasi Hapus Member</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Tindakan ini tidak dapat dibatalkan
                </DialogDescription>
              </DialogHeader>
              {memberToDelete && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-white font-medium">Anda akan menghapus member ini:</span>
                    </div>
                    <div className="ml-7 space-y-1">
                      <p className="text-white"><strong>Nama:</strong> {memberToDelete.name}</p>
                      <p className="text-white"><strong>Email:</strong> {memberToDelete.email}</p>
                      <p className="text-white"><strong>Profesi:</strong> {memberToDelete.profession}</p>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-400">
                      <strong>Peringatan:</strong> Member yang memiliki proyek aktif tidak dapat dihapus.
                      {memberToDelete.activeProjects > 0 && (
                        <span className="text-red-400 block mt-1">
                          Member ini memiliki {memberToDelete.activeProjects} proyek aktif.
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setDeleteMemberDialogOpen(false)}
                      className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleDeleteMember}
                      disabled={memberToDelete.activeProjects > 0}
                      className="bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Hapus Member
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </Tabs>
        </div>
      </main>
      </div>
    </div>
  )
}
