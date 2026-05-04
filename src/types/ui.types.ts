// UI Component Types

export interface MenuItem {
  label: string
  href: string
  icon?: string
  children?: MenuItem[]
  badge?: string
  disabled?: boolean
}

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  icon?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

export interface TableColumn<T = any> {
  id: string
  header: string
  accessor?: keyof T | ((row: T) => any)
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string | number
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ToastConfig {
  id?: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export interface DropdownOption {
  label: string
  value: string
  icon?: string
  disabled?: boolean
  group?: string
}

export interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: DropdownOption[]
  validation?: {
    pattern?: RegExp
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    custom?: (value: any) => string | undefined
  }
  helperText?: string
}
