import { NextRequest } from "next/server"
import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import { initializeSocket } from "@/lib/socket"

// This is a workaround for Next.js App Router
// Socket.IO needs a persistent HTTP server
// We'll use a custom server approach instead

export async function GET(req: NextRequest) {
  return new Response("Socket.IO endpoint - use custom server", {
    status: 200,
  })
}
