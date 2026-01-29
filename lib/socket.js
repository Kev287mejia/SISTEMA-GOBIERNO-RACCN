const { Server: SocketIOServer } = require("socket.io")

let io = null

function initializeSocket(server) {
  if (io) {
    return io
  }

  io = new SocketIOServer(server, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Join room based on user role
    socket.on("join-room", (room) => {
      socket.join(room)
      console.log(`Client ${socket.id} joined room: ${room}`)
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  return io
}

function getIO() {
  return io
}

// Event types for accounting entries
const AccountingEntryEvent = {
  CREATED: "accounting-entry:created",
  UPDATED: "accounting-entry:updated",
  DELETED: "accounting-entry:deleted",
  APPROVED: "accounting-entry:approved",
}

// Emit events to specific rooms
function emitAccountingEntryEvent(event, data, rooms) {
  if (!io) {
    console.warn("Socket.IO not initialized")
    return
  }

  const targetRooms = rooms || ["contador-general", "admin", "auditor"]
  
  targetRooms.forEach((room) => {
    io.to(room).emit(event, data)
  })

  // Also emit to all connected clients (for dashboard updates)
  io.emit(event, data)
}

module.exports = {
  initializeSocket,
  getIO,
  AccountingEntryEvent,
  emitAccountingEntryEvent,
}
