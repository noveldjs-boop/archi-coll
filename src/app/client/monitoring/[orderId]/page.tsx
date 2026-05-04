'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Send,
  ArrowLeft,
  FileText,
  Clock,
  Check,
  AlertCircle,
  Users,
  User,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Message {
  id: string
  senderId: string
  senderType: 'client' | 'architect'
  senderName: string
  message: string
  attachmentUrl: string | null
  isRead: boolean
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  buildingCategory: string
  buildingArea: string
  buildingModel: string
  status: string
  createdAt: string
}

interface RoomParticipant {
  name: string
  role: string
}

export default function ProjectMonitoringPage() {
  const router = useRouter()
  const params = useParams()
  const { language, t } = useLanguage()
  const { orderId } = React.use(params)

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [isInCall, setIsInCall] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [participants, setParticipants] = useState<RoomParticipant[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('clientUser')
    if (!userData) {
      router.push('/client/auth')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Connect to WebSocket service
      const socketInstance = io('/?XTransformPort=3002', {
        transports: ['websocket', 'polling']
      })

      socketInstance.on('connect', () => {
        console.log('Connected to WebSocket service')
        // Join the room for this order
        socketInstance.emit('join-room', {
          roomId: orderId,
          user: {
            id: parsedUser.id,
            name: parsedUser.name,
            role: 'client'
          }
        })
      })

      socketInstance.on('room-joined', (data: { participants: RoomParticipant[] }) => {
        setParticipants(data.participants)
      })

      socketInstance.on('user-joined', (data: { userName: string; participants: RoomParticipant[] }) => {
        setParticipants(data.participants)
        // Add system message
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          senderId: 'system',
          senderType: 'client' as const,
          senderName: 'System',
          message: `${data.userName} bergabung`,
          attachmentUrl: null,
          isRead: true,
          createdAt: new Date().toISOString()
        }])
      })

      socketInstance.on('user-left', (data: { userName: string; participants: RoomParticipant[] }) => {
        setParticipants(data.participants)
        // Add system message
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          senderId: 'system',
          senderType: 'client' as const,
          senderName: 'System',
          message: `${data.userName} meninggalkan`,
          attachmentUrl: null,
          isRead: true,
          createdAt: new Date().toISOString()
        }])
      })

      socketInstance.on('new-message', (data: any) => {
        setMessages(prev => [...prev, {
          id: data.id,
          senderId: data.senderId,
          senderType: data.senderRole === 'architect' ? 'architect' : 'client',
          senderName: data.senderName,
          message: data.message,
          attachmentUrl: null,
          isRead: true,
          createdAt: data.timestamp
        }])
      })

      socketInstance.on('video-call-started', (data: any) => {
        console.log('Video call started by:', data.initiatorName)
      })

      socketInstance.on('video-call-ended', (data: any) => {
        console.log('Video call ended by:', data.userName)
        if (isInCall) {
          endCall()
        }
      })

      socketInstance.on('user-typing', (data: { userId: string; userName: string }) => {
        setTypingUsers(prev => new Set([...prev, data.userId]))
      })

      socketInstance.on('user-stopped-typing', (data: { userId: string }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      })

      socketInstance.on('disconnect', () => {
        console.log('Disconnected from WebSocket service')
      })

      setSocket(socketInstance)
    } catch (err) {
      router.push('/client/auth')
      return
    }

    // Fetch order details
    fetchOrderDetails()

    // Fetch messages
    fetchMessages()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [orderId, router])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}`)
      const data = await res.json()
      if (data.data) {
        setOrder(data.data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/client/orders/${orderId}/messages`)
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return

    const messageText = newMessage.trim()

    try {
      // Send via WebSocket for real-time
      if (socket) {
        socket.emit('send-message', {
          roomId: orderId,
          message: messageText,
          sender: {
            id: user.id,
            name: user.name,
            role: 'client'
          }
        })
      }

      // Also save to database via API
      const res = await fetch(`/api/client/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          senderId: user.id,
          senderType: 'client',
          senderName: user.name
        })
      })

      if (res.ok) {
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const toggleVideo = async () => {
    if (videoEnabled) {
      // Stop video
      localStreamRef.current?.getVideoTracks().forEach(track => track.stop())
      setVideoEnabled(false)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        localStreamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setVideoEnabled(true)
      } catch (error) {
        console.error('Error accessing camera:', error)
        alert(language === 'id' ? 'Tidak dapat mengakses kamera' : 'Cannot access camera')
      }
    }
  }

  const toggleAudio = async () => {
    if (audioEnabled) {
      // Stop audio
      localStreamRef.current?.getAudioTracks().forEach(track => track.stop())
      setAudioEnabled(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (!localStreamRef.current) {
          localStreamRef.current = stream
        } else {
          // Add audio track to existing stream
          stream.getAudioTracks().forEach(track => {
            localStreamRef.current?.addTrack(track)
          })
        }
        setAudioEnabled(true)
      } catch (error) {
        console.error('Error accessing microphone:', error)
        alert(language === 'id' ? 'Tidak dapat mengakses mikrofon' : 'Cannot access microphone')
      }
    }
  }

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      localStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setVideoEnabled(true)
      setAudioEnabled(true)
      setIsInCall(true)

      // Notify via WebSocket
      if (socket && user) {
        socket.emit('video-call-start', {
          roomId: orderId,
          initiator: {
            id: user.id,
            name: user.name
          }
        })
      }

      // Also notify server via API
      await fetch(`/api/client/orders/${orderId}/video-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' })
      })
    } catch (error) {
      console.error('Error starting call:', error)
      alert(language === 'id' ? 'Gagal memulai panggilan video' : 'Failed to start video call')
    }
  }

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    localStreamRef.current = null
    setVideoEnabled(false)
    setAudioEnabled(false)
    setIsInCall(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    // Notify via WebSocket
    if (socket && user) {
      socket.emit('video-call-end', {
        roomId: orderId,
        userId: user.id,
        userName: user.name
      })
    }

    // Notify server via API
    fetch(`/api/client/orders/${orderId}/video-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'end' })
    }).catch(console.error)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      in_pre_design: { label: 'Pra-Desain', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: FileText },
      in_schematic: { label: 'Schematic', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: FileText },
      in_ded: { label: 'DED', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', icon: FileText },
      in_review: { label: 'Review', className: 'bg-pink-500/20 text-pink-400 border-pink-500/30', icon: FileText },
      completed: { label: 'Selesai', className: 'bg-green-500/20 text-green-400 border-green-500/30', icon: Check },
    }
    const config = statusConfig[status] || statusConfig.in_pre_design
    const Icon = config.icon
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1E1E1E]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6B5B95] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">{language === 'id' ? 'Memuat...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[#1E1E1E]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[#1E1E1E]/80 backdrop-blur-lg border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {language === 'id' ? 'Monitoring Proyek' : 'Project Monitoring'}
              </h1>
              {order && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-400">{order.orderNumber}</span>
                  {getStatusBadge(order.status)}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gradient-to-br from-[#6B5B95] to-[#9B59B6] text-white text-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'C'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video/Call Section */}
        <div className="flex-1 flex flex-col border-r border-gray-800">
          <Card className="flex-1 m-4 bg-[#2a2a2a]/50 border-gray-800">
            <CardContent className="p-4 h-full flex flex-col">
              {isInCall ? (
                <>
                  {/* Video Display */}
                  <div className="flex-1 bg-black rounded-lg overflow-hidden relative mb-4">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {!videoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Users className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded text-white text-sm">
                      {user?.name || language === 'id' ? 'Anda' : 'You'}
                    </div>
                  </div>

                  {/* Call Controls */}
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={toggleVideo}
                      variant={videoEnabled ? 'default' : 'outline'}
                      className={videoEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-gray-700 text-white'}
                    >
                      {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={audioEnabled ? 'default' : 'outline'}
                      className={audioEnabled ? 'bg-green-600 hover:bg-green-700' : 'border-gray-700 text-white'}
                    >
                      {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={endCall}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <VideoOff className="w-5 h-5 mr-2" />
                      {language === 'id' ? 'Akhiri' : 'End'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <Video className="w-24 h-24 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {language === 'id' ? 'Siap untuk Video Conference?' : 'Ready for Video Conference?'}
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    {language === 'id'
                      ? 'Mulai panggilan video untuk berdiskusi langsung dengan arsitek dan tenaga ahli'
                      : 'Start a video call to discuss directly with architects and experts'}
                  </p>
                  <Button
                    onClick={startCall}
                    className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    {language === 'id' ? 'Mulai Panggilan Video' : 'Start Video Call'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Section */}
        <div className="w-96 flex flex-col bg-[#121212]">
          <div className="flex-shrink-0 p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {language === 'id' ? 'Chat Proyek' : 'Project Chat'}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">
                  {language === 'id' ? 'Belum ada pesan' : 'No messages yet'}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderType === 'client'
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${isOwn ? 'order-2' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!isOwn && (
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gradient-to-br from-[#E74C3C] to-[#F39C12] text-white text-xs">
                              {msg.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="text-xs text-gray-500">{msg.senderName}</span>
                        <span className="text-xs text-gray-600">
                          {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`p-3 rounded-lg ${
                          isOwn
                            ? 'bg-gradient-to-r from-[#6B5B95] to-[#9B59B6] text-white'
                            : 'bg-gray-800 text-gray-200'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex-shrink-0 p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={language === 'id' ? 'Tulis pesan...' : 'Type a message...'}
                className="flex-1 bg-[#1E1E1E] border-gray-700 text-white"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-gradient-to-r from-[#6B5B95] to-[#9B59B6]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
