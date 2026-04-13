import { Server } from 'socket.io'

const PORT = 3002
const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Store active rooms and their participants
const rooms = new Map<string, Set<string>>()
const roomParticipants = new Map<string, Map<string, { name: string; role: string }>>()

console.log(`Video Chat Service running on port ${PORT}`)

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Join a room (for specific project monitoring)
  socket.on('join-room', (data: { roomId: string; user: { id: string; name: string; role: string } }) => {
    const { roomId, user } = data

    socket.join(roomId)

    // Track participants
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }
    rooms.get(roomId)!.add(socket.id)

    if (!roomParticipants.has(roomId)) {
      roomParticipants.set(roomId, new Map())
    }
    roomParticipants.get(roomId)!.set(socket.id, { name: user.name, role: user.role })

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      participants: Array.from(roomParticipants.get(roomId)!.values())
    })

    // Send current participants to the new user
    const participants = Array.from(roomParticipants.get(roomId)!.values())
    socket.emit('room-joined', { participants })

    console.log(`User ${user.name} joined room ${roomId}`)
  })

  // Leave a room
  socket.on('leave-room', (data: { roomId: string; user: { id: string; name: string } }) => {
    const { roomId, user } = data

    socket.leave(roomId)

    // Remove from tracking
    if (rooms.has(roomId)) {
      rooms.get(roomId)!.delete(socket.id)
      if (rooms.get(roomId)!.size === 0) {
        rooms.delete(roomId)
      }
    }

    if (roomParticipants.has(roomId)) {
      roomParticipants.get(roomId)!.delete(socket.id)
      if (roomParticipants.get(roomId)!.size === 0) {
        roomParticipants.delete(roomId)
      }
    }

    // Notify others
    socket.to(roomId).emit('user-left', {
      userId: user.id,
      userName: user.name,
      participants: roomParticipants.has(roomId) ? Array.from(roomParticipants.get(roomId)!.values()) : []
    })

    console.log(`User ${user.name} left room ${roomId}`)
  })

  // Send chat message
  socket.on('send-message', (data: { roomId: string; message: string; sender: { id: string; name: string; role: string } }) => {
    const { roomId, message, sender } = data

    // Broadcast to all in room including sender
    io.to(roomId).emit('new-message', {
      id: `msg-${Date.now()}-${Math.random()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderRole: sender.role,
      message,
      timestamp: new Date().toISOString()
    })

    console.log(`Message in room ${roomId} from ${sender.name}: ${message}`)
  })

  // Video call signaling
  socket.on('video-call-start', (data: { roomId: string; initiator: { id: string; name: string } }) => {
    socket.to(data.roomId).emit('video-call-started', {
      initiatorId: data.initiator.id,
      initiatorName: data.initiator.name,
      timestamp: new Date().toISOString()
    })

    console.log(`Video call started in room ${data.roomId} by ${data.initiator.name}`)
  })

  socket.on('video-call-end', (data: { roomId: string; userId: string; userName: string }) => {
    socket.to(data.roomId).emit('video-call-ended', {
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString()
    })

    console.log(`Video call ended in room ${data.roomId} by ${data.userName}`)
  })

  // WebRTC signaling
  socket.on('webrtc-offer', (data: { roomId: string; offer: any; senderId: string; senderName: string }) => {
    socket.to(data.roomId).emit('webrtc-offer', {
      offer: data.offer,
      senderId: data.senderId,
      senderName: data.senderName
    })
  })

  socket.on('webrtc-answer', (data: { roomId: string; answer: any; senderId: string }) => {
    socket.to(data.roomId).emit('webrtc-answer', {
      answer: data.answer,
      senderId: data.senderId
    })
  })

  socket.on('webrtc-ice-candidate', (data: { roomId: string; candidate: any; senderId: string }) => {
    socket.to(data.roomId).emit('webrtc-ice-candidate', {
      candidate: data.candidate,
      senderId: data.senderId
    })
  })

  // Typing indicators
  socket.on('typing-start', (data: { roomId: string; userId: string; userName: string }) => {
    socket.to(data.roomId).emit('user-typing', {
      userId: data.userId,
      userName: data.userName
    })
  })

  socket.on('typing-stop', (data: { roomId: string; userId: string }) => {
    socket.to(data.roomId).emit('user-stopped-typing', {
      userId: data.userId
    })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)

    // Remove from all rooms
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id)

        const participant = roomParticipants.get(roomId)?.get(socket.id)
        if (participant) {
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            userName: participant.name,
            participants: Array.from(roomParticipants.get(roomId)!.values())
          })

          roomParticipants.get(roomId)?.delete(socket.id)
        }

        if (participants.size === 0) {
          rooms.delete(roomId)
          roomParticipants.delete(roomId)
        }
      }
    })
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  io.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  io.close()
  process.exit(0)
})
