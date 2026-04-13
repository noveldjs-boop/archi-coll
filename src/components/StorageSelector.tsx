'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HardDrive, Folder, Cloud, Check, XCircle, Info } from 'lucide-react'

export type StorageType = 'local' | 'drive'

interface StorageSelectorProps {
  storageType: StorageType
  onStorageChange: (type: StorageType) => void
  language?: 'id' | 'en'
  disabled?: boolean
}

interface ConnectionStatus {
  success: boolean
  connected: boolean
  googleEmail: string | null
  hasToken: boolean
  hasRefreshToken: boolean
  error?: string
}

const translations = {
  en: {
    title: 'Storage Selection',
    description: 'Choose where to save your files',
    localStorage: 'Local Storage',
    googleDrive: 'Google Drive',
    localStorageDesc: 'Save files on the server',
    googleDriveDesc: 'Save files to your Google Drive',
    connectGoogleDrive: 'Connect Google Drive',
    googleDriveOptional: 'Google Drive is optional - you can save files to the server without connecting',
    connected: 'Connected',
    notConnected: 'Not Connected',
    default: 'Default',
    requiredForDrive: 'Google Drive connection required for this option',
    info: 'Info',
    switchStorage: 'You can change storage preference for each file upload',
  },
  id: {
    title: 'Pilih Penyimpanan',
    description: 'Pilih lokasi penyimpanan file Anda',
    localStorage: 'Penyimpanan Lokal',
    googleDrive: 'Google Drive',
    localStorageDesc: 'Simpan file di server',
    googleDriveDesc: 'Simpan file ke Google Drive Anda',
    connectGoogleDrive: 'Hubungkan Google Drive',
    googleDriveOptional: 'Google Drive bersifat opsional - Anda tetap bisa menyimpan file di server tanpa menghubungkan Google Drive',
    connected: 'Terhubung',
    notConnected: 'Tidak Terhubung',
    default: 'Default',
    requiredForDrive: 'Koneksi Google Drive diperlukan untuk opsi ini',
    info: 'Info',
    switchStorage: 'Anda dapat mengubah preferensi penyimpanan untuk setiap upload file',
  },
}

export function StorageSelector({
  storageType,
  onStorageChange,
  language = 'id',
  disabled = false,
}: StorageSelectorProps) {
  const t = translations[language]
  const [driveStatus, setDriveStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch Google Drive status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/google-drive/status')
        const data = await response.json()
        setDriveStatus(data)
      } catch (error) {
        console.error('Error fetching Google Drive status:', error)
        setDriveStatus({
          success: false,
          connected: false,
          googleEmail: null,
          hasToken: false,
          hasRefreshToken: false,
          error: 'Failed to fetch status',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  const isDriveAvailable = driveStatus?.connected
  const canUseDrive = isDriveAvailable

  return (
    <Card className="bg-[#2a2a2a]/50 border-gray-800 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Folder className="w-5 h-5 text-[#9B59B6]" />
              {t.title}
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              {t.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-[#6B5B95]/10 text-[#9B59B6] border-[#6B5B95]/30">
            {t.info}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <Alert className="bg-blue-500/10 border-blue-500/30">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300 text-sm">
            {t.googleDriveOptional}
          </AlertDescription>
        </Alert>

        {/* Storage Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Storage Option */}
          <button
            onClick={() => onStorageChange('local')}
            disabled={disabled}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${storageType === 'local'
                ? 'border-[#6B5B95] bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/5'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${storageType === 'local' ? 'bg-[#6B5B95]' : 'bg-gray-700'}
              `}>
                <HardDrive className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">
                    {t.localStorage}
                  </h3>
                  {storageType === 'local' && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {t.default}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {t.localStorageDesc}
                </p>
                {storageType === 'local' && (
                  <Check className="w-5 h-5 text-green-400 mt-2" />
                )}
              </div>
            </div>
          </button>

          {/* Google Drive Option */}
          <button
            onClick={() => {
              if (canUseDrive) {
                onStorageChange('drive')
              }
            }}
            disabled={disabled || !canUseDrive}
            className={`
              relative p-4 rounded-lg border-2 transition-all text-left
              ${storageType === 'drive' && canUseDrive
                ? 'border-[#6B5B95] bg-gradient-to-br from-[#6B5B95]/20 to-[#9B59B6]/5'
                : !canUseDrive
                ? 'border-gray-700 bg-gray-800/50 opacity-50'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }
              ${disabled || !canUseDrive ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${storageType === 'drive' && canUseDrive ? 'bg-[#4285F4]' : 'bg-gray-700'}
              `}>
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">
                    {t.googleDrive}
                  </h3>
                  {driveStatus?.connected && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                      {t.connected}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {t.googleDriveDesc}
                </p>
                {driveStatus?.connected && driveStatus.googleEmail && (
                  <p className="text-xs text-gray-500 mt-1">
                    {driveStatus.googleEmail}
                  </p>
                )}
                {!canUseDrive && (
                  <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
                    <XCircle className="w-3 h-3" />
                    {t.notConnected}
                  </div>
                )}
                {storageType === 'drive' && canUseDrive && (
                  <Check className="w-5 h-5 text-green-400 mt-2" />
                )}
              </div>
            </div>
          </button>
        </div>

        {/* Connection Status for Google Drive */}
        {storageType === 'drive' && !canUseDrive && (
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <XCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300 text-sm">
              {t.requiredForDrive}
            </AlertDescription>
          </Alert>
        )}

        {/* Connect Google Drive Button */}
        {!isDriveAvailable && (
          <Button
            onClick={() => window.location.href = '/api/google-drive/auth'}
            variant="outline"
            className="w-full border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4]/10"
          >
            <Cloud className="w-4 h-4 mr-2" />
            {t.connectGoogleDrive}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
