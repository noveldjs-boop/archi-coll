import { MaterialAdsManager } from "@/components/admin/MaterialAdsManager"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function MaterialAdsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin">
            <button className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Admin Dashboard
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-white">Manajemen Iklan Material</h1>
          <p className="text-gray-400 mt-2">
            Kelola iklan produk material konstruksi dan upload katalog produk
          </p>
        </div>

        <MaterialAdsManager />
      </div>
    </div>
  )
}
