"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Edit, DollarSign, Megaphone, Users, ArrowLeft } from "lucide-react"

export default function AdminLoginSelector() {
  const roles = [
    {
      name: "Editor",
      description: "Kelola konten website, proyek, dan layanan",
      icon: Edit,
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700",
      loginPath: "/login/editor",
    },
    {
      name: "Finance",
      description: "Kelola keuangan dan pembayaran",
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      hoverColor: "from-green-600 to-green-700",
      loginPath: "/login/finance",
    },
    {
      name: "Marketing",
      description: "Kelola partnership dan promosi",
      icon: Megaphone,
      color: "from-orange-500 to-orange-600",
      hoverColor: "from-orange-600 to-orange-700",
      loginPath: "/login/marketing",
    },
    {
      name: "HRD",
      description: "Kelola anggota tim dan sumber daya",
      icon: Users,
      color: "from-pink-500 to-pink-600",
      hoverColor: "from-pink-600 to-pink-700",
      loginPath: "/login/hrd",
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-5xl">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-[#6B5B95] to-[#8B7AB8] p-4 rounded-full">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Portal Admin ARCHI-COLL
          </h1>
          <p className="text-gray-400 text-lg">
            Pilih role untuk masuk ke dashboard masing-masing
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <Link key={role.name} href={role.loginPath}>
                <Card className="h-full bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-pointer group">
                  <CardHeader>
                    <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${role.color} mb-4 group-hover:from-${role.hoverColor} group-hover:to-${role.color}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white text-center">
                      {role.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-center">
                      {role.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-[#6B5B95] to-[#8B7AB8] hover:from-[#5a4a84] hover:to-[#7a6aa7] text-white">
                      Login {role.name}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Hubungi administrator jika Anda mengalami kesulitan login.
          </p>
          <p className="mt-2">
            Dapatkan akses login dari administrator resmi ARCHI-COLL.
          </p>
        </div>
      </div>
    </div>
  )
}
