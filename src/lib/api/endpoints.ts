// API Endpoint Constants

export const API_ENDPOINTS = {
  // Content
  SERVICES: '/api/services',
  PORTFOLIO: '/api/portfolio',
  ABOUT: '/api/about',
  ABOUT_CONTENT: '/api/about-content',
  TEAM_MEMBERS: '/api/team-members',
  CONTACT_INFO: '/api/contact-info',
  OPERATING_HOURS: '/api/operating-hours',
  HOME_STATS: '/api/home-stats',

  // Contact
  CONTACT: '/api/contact',
  CONTACT_FORM_FIELDS: '/api/contact-form-fields',

  // Building Categories
  BUILDING_CATEGORIES: '/api/building-categories',
  BUILDING_CATEGORY: (id: string) => `/api/building-categories/${id}`,
  BUILDING_CATEGORY_FORM_FIELDS: (id: string) => `/api/building-categories/${id}/form-fields`,
  BUILDING_CATEGORY_FORM_FIELD: (id: string, fieldId: string) =>
    `/api/building-categories/${id}/form-fields/${fieldId}`,

  // Pricing
  PRICING_RULES: '/api/pricing-rules',
  PRICING_RULE: (id: string) => `/api/pricing-rules/${id}`,
  PRICING_RULE_TOGGLE: (id: string) => `/api/pricing-rules/${id}/toggle`,
  CALCULATE_PRICE: '/api/calculate-price',
  CALCULATE_DESIGN_PRICE: '/api/calculate-design-price',

  // Orders
  ORDERS: '/api/orders',
  ORDER: (id: string) => `/api/orders/${id}`,

  // Members
  MEMBERS_REGISTER: '/api/members/register',
  MEMBERS_ME: '/api/members/me',
  MEMBERS_CHECK_EMAIL: '/api/members/check-email',
  MEMBERS_CHECK_STATUS: '/api/members/check-status',
  MEMBERS_RESET_PASSWORD: '/api/members/reset-password',
  MEMBERS_SWITCH_PROFESSION: '/api/members/switch-profession',
  MEMBERS_INBOX: '/api/members/inbox',
  MEMBERS_ASSIGNMENTS: '/api/members/assignments',
  MEMBER_PROFILE: (id: string) => `/api/member/profile/${id}`,

  // Member Projects
  MEMBER_PROJECT_CHAT: (projectId: string) => `/api/members/projects/${projectId}/chat`,
  MEMBER_PROJECT_REVISIONS: (projectId: string) => `/api/members/projects/${projectId}/revisions`,

  // Admin - Members
  ADMIN_MEMBERS: '/api/admin/members',
  ADMIN_MEMBER: (id: string) => `/api/admin/members/${id}`,
  ADMIN_MEMBER_STATUS: (id: string) => `/api/admin/members/${id}/status`,
  ADMIN_MEMBER_DELETE: (id: string) => `/api/admin/members/${id}/delete`,

  // Admin - Content
  ADMIN_ABOUT_CONTENT: '/api/admin/about-content',
  ADMIN_ABOUT_CONTENT_ITEM: (id: string) => `/api/admin/about-content/${id}`,
  ADMIN_SERVICES: '/api/admin/services',
  ADMIN_SERVICE: (id: string) => `/api/admin/services/${id}`,
  ADMIN_SERVICE_FEATURES: (id: string) => `/api/admin/services/${id}/features`,
  ADMIN_SERVICE_FEATURE: (id: string) => `/api/admin/service-features/${id}`,
  ADMIN_SERVICE_UPLOAD_IMAGE: (id: string) => `/api/admin/services/${id}/upload-image`,
  ADMIN_PROJECTS: '/api/admin/projects',
  ADMIN_PROJECT: (id: string) => `/api/admin/projects/${id}`,
  ADMIN_PROJECT_UPLOAD_IMAGE: (id: string) => `/api/admin/projects/${id}/upload-image`,
  ADMIN_TEAM_MEMBERS: '/api/admin/team-members',
  ADMIN_TEAM_MEMBER: (id: string) => `/api/admin/team-members/${id}`,
  ADMIN_TEAM_MEMBER_UPLOAD_PHOTO: (id: string) => `/api/admin/team-members/${id}/upload-photo`,
  ADMIN_HOME_STATS: '/api/admin/home-stats',
  ADMIN_HOME_STAT: (id: string) => `/api/admin/home-stats/${id}`,
  ADMIN_HOME_STAT_TOGGLE: (id: string) => `/api/admin/home-stats/${id}/toggle`,
  ADMIN_CONTACT_INFO: '/api/admin/contact-info',
  ADMIN_CONTACT_INFO_ITEM: (id: string) => `/api/admin/contact-info/${id}`,
  ADMIN_OPERATING_HOURS: '/api/admin/operating-hours',
  ADMIN_OPERATING_HOUR: (id: string) => `/api/admin/operating-hours/${id}`,
  ADMIN_FORM_REQUIREMENTS: '/api/admin/form-requirements',
  ADMIN_FORM_REQUIREMENT: (id: string) => `/api/admin/form-requirements/${id}`,

  // Projects
  PROJECTS: '/api/projects',
  PROJECT_TEAM: (id: string) => `/api/project/${id}/team`,

  // Stats
  STATS: '/api/stats',

  // Images
  IMAGES: '/api/images',
  GENERATE_PORTFOLIO_IMAGE: '/api/generate-portfolio-image',

  // Form Requirements
  FORM_REQUIREMENTS: '/api/form-requirements',

  // Auth
  AUTH: '/api/auth',
  AUTH_ADMIN: '/api/auth-admin',
} as const
