"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"

export enum AccountingEntryEvent {
  CREATED = "accounting-entry:created",
  UPDATED = "accounting-entry:updated",
  DELETED = "accounting-entry:deleted",
  APPROVED = "accounting-entry:approved",
}

export enum PayrollEvent {
  CREATED = "payroll:created",
  UPDATED = "payroll:updated",
  PROCESSED = "payroll:processed",
  PAID = "payroll:paid",
}

export enum CajaEvent {
  MOVEMENT_CREATED = "caja:movement-created",
  CHECK_CREATED = "caja:check-created",
  CLOSURE_SUBMITTED = "caja:closure-submitted",
}

interface UseSocketOptions {
  onEntryCreated?: (data: any) => void
  onEntryUpdated?: (data: any) => void
  onEntryDeleted?: (data: any) => void
  onEntryApproved?: (data: any) => void
  onPayrollCreated?: (data: any) => void
  onPayrollUpdated?: (data: any) => void
  onPayrollProcessed?: (data: any) => void
  onPayrollPaid?: (data: any) => void
  onCajaMovementCreated?: (data: any) => void
  onCajaCheckCreated?: (data: any) => void
  onCajaClosureSubmitted?: (data: any) => void
  onNewNotification?: (data: any) => void
  enabled?: boolean
}

export function useSocket(options: UseSocketOptions = {}) {
  const { data: session } = useSession()
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const {
    onEntryCreated,
    onEntryUpdated,
    onEntryDeleted,
    onEntryApproved,
    onPayrollCreated,
    onPayrollUpdated,
    onPayrollProcessed,
    onPayrollPaid,
    onCajaMovementCreated,
    onCajaCheckCreated,
    onCajaClosureSubmitted,
    onNewNotification,
    enabled = true,
  } = options

  useEffect(() => {
    if (!enabled || !session?.user) {
      return
    }

    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== "undefined" ? window.location.origin : "")

    const socket = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketRef.current = socket

    // Connection events
    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id)
      setIsConnected(true)

      // Join room based on user role
      const role = session.user.role.toLowerCase().replace(/\s+/g, "-")
      socket.emit("join-room", role)

      // Also join general rooms
      if (role === "contadorgeneral" || role === "admin" || role === "auditor" || role === "coordinadorgobierno" || role === "directoradaf") {
        socket.emit("join-room", "contador-general")
      }
      if (role === "rrhh" || role === "directorarrhh" || role === "admin") {
        socket.emit("join-room", "rrhh")
      }
      if (role === "admin") {
        socket.emit("join-room", "admin")
      }

      // Join private user room for targeted notifications
      if (session.user.id) {
        socket.emit("join-room", session.user.id)
      }
    })

    socket.on("disconnect", () => {
      console.log("Socket.IO disconnected")
      setIsConnected(false)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error)
      setIsConnected(false)
    })

    // Accounting entry events
    if (onEntryCreated) socket.on(AccountingEntryEvent.CREATED, onEntryCreated)
    if (onEntryUpdated) socket.on(AccountingEntryEvent.UPDATED, onEntryUpdated)
    if (onEntryDeleted) socket.on(AccountingEntryEvent.DELETED, onEntryDeleted)
    if (onEntryApproved) socket.on(AccountingEntryEvent.APPROVED, onEntryApproved)

    // Payroll events
    if (onPayrollCreated) socket.on(PayrollEvent.CREATED, onPayrollCreated)
    if (onPayrollUpdated) socket.on(PayrollEvent.UPDATED, onPayrollUpdated)
    if (onPayrollProcessed) socket.on(PayrollEvent.PROCESSED, onPayrollProcessed)
    if (onPayrollPaid) socket.on(PayrollEvent.PAID, onPayrollPaid)

    // Caja events
    if (onCajaMovementCreated) socket.on(CajaEvent.MOVEMENT_CREATED, onCajaMovementCreated)
    if (onCajaCheckCreated) socket.on(CajaEvent.CHECK_CREATED, onCajaCheckCreated)
    if (onCajaClosureSubmitted) socket.on(CajaEvent.CLOSURE_SUBMITTED, onCajaClosureSubmitted)

    // New real-time notification listener
    if (onNewNotification) socket.on("new-notification", onNewNotification)

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off(AccountingEntryEvent.CREATED)
        socket.off(AccountingEntryEvent.UPDATED)
        socket.off(AccountingEntryEvent.DELETED)
        socket.off(AccountingEntryEvent.APPROVED)
        socket.off(PayrollEvent.CREATED)
        socket.off(PayrollEvent.UPDATED)
        socket.off(PayrollEvent.PROCESSED)
        socket.off(PayrollEvent.PAID)
        socket.off(CajaEvent.MOVEMENT_CREATED)
        socket.off(CajaEvent.CHECK_CREATED)
        socket.off(CajaEvent.CLOSURE_SUBMITTED)
        socket.disconnect()
      }
    }
  }, [
    enabled,
    session,
    onEntryCreated,
    onEntryUpdated,
    onEntryDeleted,
    onEntryApproved,
    onPayrollCreated,
    onPayrollUpdated,
    onPayrollProcessed,
    onPayrollPaid,
    onCajaMovementCreated,
    onCajaCheckCreated,
    onCajaClosureSubmitted,
    onNewNotification
  ])

  return {
    socket: socketRef.current,
    isConnected,
  }
}
