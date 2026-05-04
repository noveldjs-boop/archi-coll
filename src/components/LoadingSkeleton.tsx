import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[#2a2a2a]', className)}
    />
  )
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('rounded-lg border border-gray-700 bg-[#2a2a2a]/80 p-6', className)}>
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-700 bg-[#2a2a2a]/80 p-6">
      <Skeleton className="h-16 w-16 mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-10 w-full mt-6" />
    </div>
  )
}

export function PortfolioCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-700 bg-[#2a2a2a]/80 overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  )
}

export function TeamMemberSkeleton() {
  return (
    <div className="rounded-lg border border-gray-700 bg-[#2a2a2a]/80 p-6 text-center">
      <div className="flex justify-center mb-4">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
      <Skeleton className="h-4 w-1/2 mx-auto" />
    </div>
  )
}

export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}
