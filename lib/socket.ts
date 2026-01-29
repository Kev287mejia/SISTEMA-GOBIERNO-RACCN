import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import type { Server as SocketIOServerType } from "socket.io"

let io: SocketIOServerType | null = null

export function initializeSocket(server: HTTPServer) {
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
    socket.on("join-room", (room: string) => {
      socket.join(room)
      console.log(`Client ${socket.id} joined room: ${room}`)
    })

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
    })
  })

  return io
}

export function getIO(): SocketIOServerType | null {
  return io
}

// Event types for accounting entries
export enum AccountingEntryEvent {
  CREATED = "accounting-entry:created",
  UPDATED = "accounting-entry:updated",
  DELETED = "accounting-entry:deleted",
  APPROVED = "accounting-entry:approved",
}

// Event types for payroll
export enum PayrollEvent {
  CREATED = "payroll:created",
  UPDATED = "payroll:updated",
  PROCESSED = "payroll:processed",
  PAID = "payroll:paid",
}

// Emit events to specific rooms
export function emitAccountingEntryEvent(
  event: AccountingEntryEvent,
  data: any,
  rooms?: string[]
) {
  if (!io) {
    console.warn("Socket.IO not initialized - events will not be emitted")
    return
  }

  const targetRooms = rooms || ["contador-general", "admin", "auditor"]

  targetRooms.forEach((room) => {
    io!.to(room).emit(event, data)
  })

  // Also emit to all connected clients (for dashboard updates)
  io.emit(event, data)

  console.log(`Emitted ${event} event`, data)
}

export function emitPayrollEvent(
  event: PayrollEvent,
  data: any,
  rooms?: string[]
) {
  if (!io) {
    console.warn("Socket.IO not initialized - events will not be emitted")
    return
  }

  const targetRooms = rooms || ["rrhh", "directora-rrhh", "admin"]

  targetRooms.forEach((room) => {
    io!.to(room).emit(event, data)
  })

  // Also emit to all connected clients
  io.emit(event, data)

  console.log(`Emitted ${event} event`, data)
}

// Event types for Caja
export enum CajaEvent {
  MOVEMENT_CREATED = "caja:movement-created",
  CHECK_CREATED = "caja:check-created",
  CLOSURE_SUBMITTED = "caja:closure-submitted",
}

export function emitCajaEvent(
  event: CajaEvent,
  data: any,
  rooms?: string[]
) {
  if (!io) {
    console.warn("Socket.IO not initialized - events will not be emitted")
    return
  }

  const targetRooms = rooms || ["contador-general", "admin", "auditor"]

  targetRooms.forEach((room) => {
    io!.to(room).emit(event, data)
  })

  // Also emit to all connected clients
  io.emit(event, data)

  console.log(`Emitted ${event} event`, data)
}

// Event types for Caja Chica
export enum PettyCashEvent {
  BALANCE_CHANGED = "petty-cash:balance-changed",
  MOVEMENT_CREATED = "petty-cash:movement-created",
  INCONSISTENCY_MARKED = "petty-cash:inconsistency-marked",
}

export function emitPettyCashEvent(
  event: PettyCashEvent,
  data: any,
  rooms?: string[]
) {
  if (!io) {
    console.warn("Socket.IO not initialized - events will not be emitted")
    return
  }

  const targetRooms = rooms || ["contador-general", "admin", "auditor", "responsable-credito"]

  targetRooms.forEach((room) => {
    io!.to(room).emit(event, data)
  })

  // Also emit to dashboard viewers
  io.emit(event, data)

  console.log(`Emitted ${event} event`, data)
}

