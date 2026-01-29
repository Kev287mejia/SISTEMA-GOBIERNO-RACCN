# Socket.IO Real-time Updates Setup

This document describes the Socket.IO implementation for real-time updates in the accounting system.

## Overview

Socket.IO is used to provide real-time updates to the Contador General dashboard whenever accounting entries are created, updated, deleted, or approved.

## Architecture

### Server-Side

1. **Custom Server** (`server.js`): Next.js custom server that initializes both the Next.js app and Socket.IO server
2. **Socket.IO Server** (`lib/socket.js`): Socket.IO server initialization and event emission logic
3. **Accounting Functions** (`lib/accounting.ts`): Emit Socket.IO events after database operations

### Client-Side

1. **Socket Hook** (`hooks/useSocket.ts`): React hook for managing Socket.IO connections
2. **Real-time Component** (`components/dashboard/accounting-entries-realtime.tsx`): Dashboard component that displays real-time updates

## Events

### Accounting Entry Events

- `accounting-entry:created` - Emitted when a new entry is created
- `accounting-entry:updated` - Emitted when an entry is updated
- `accounting-entry:deleted` - Emitted when an entry is deleted
- `accounting-entry:approved` - Emitted when an entry is approved

### Event Data Structure

```typescript
{
  id: string
  numero: string
  tipo: "INGRESO" | "EGRESO"
  monto: number
  descripcion: string
  institucion: "GOBIERNO" | "CONCEJO"
  estado: string
  fecha: Date
  creadoPor?: {
    nombre: string
    apellido?: string
  }
  aprobadoPor?: {
    nombre: string
    apellido?: string
  }
}
```

## Rooms

Users are automatically joined to rooms based on their roles:

- `contador-general` - ContadorGeneral, Admin, Auditor
- `admin` - Admin only
- `auditor` - Auditor only
- Role-based rooms (e.g., `contadorgeneral`, `admin`, `auditor`)

Events are emitted to relevant rooms to ensure only authorized users receive updates.

## Setup Instructions

### 1. Install Dependencies

Dependencies are already added to `package.json`:
- `socket.io`
- `socket.io-client`

### 2. Environment Variables

Add to `.env`:

```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"
```

For production, set this to your production URL.

### 3. Start the Server

The custom server is configured in `package.json`:

```bash
npm run dev  # Development (uses custom server)
npm run start  # Production (uses custom server)
```

### 4. Using the Real-time Component

The `AccountingEntriesRealtime` component is automatically included in the dashboard for ContadorGeneral and Admin users.

To use it in other components:

```tsx
import { AccountingEntriesRealtime } from "@/components/dashboard/accounting-entries-realtime"

export function MyComponent() {
  return <AccountingEntriesRealtime />
}
```

## Custom Hook Usage

To use Socket.IO in your own components:

```tsx
import { useSocket, AccountingEntryEvent } from "@/hooks/useSocket"

export function MyComponent() {
  const { isConnected } = useSocket({
    onEntryCreated: (data) => {
      console.log("New entry created:", data)
      // Update your UI
    },
    onEntryUpdated: (data) => {
      console.log("Entry updated:", data)
    },
    onEntryDeleted: (data) => {
      console.log("Entry deleted:", data)
    },
    onEntryApproved: (data) => {
      console.log("Entry approved:", data)
    },
    enabled: true, // Set to false to disable
  })

  return (
    <div>
      {isConnected ? "Connected" : "Disconnected"}
    </div>
  )
}
```

## Connection Status

The real-time component displays a connection status indicator:
- Green dot: Connected
- Red dot: Disconnected

## Features

### Automatic Reconnection

Socket.IO automatically reconnects if the connection is lost:
- Reconnection delay: 1 second
- Max reconnection attempts: 5

### Room-Based Broadcasting

Events are sent to specific rooms based on user roles, ensuring:
- Only authorized users receive updates
- Efficient message delivery
- Role-based access control

### Real-time Statistics

The dashboard component automatically updates:
- Total income (INGRESO)
- Total expenses (EGRESO)
- Pending entries count
- Approved entries count

### Recent Entries List

Shows the 10 most recent entries with:
- Entry number
- Institution badge
- Status badge
- Amount (color-coded by type)
- Creator information
- Date

## Troubleshooting

### Connection Issues

1. Check that the custom server is running (`npm run dev`)
2. Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly
3. Check browser console for connection errors
4. Verify Socket.IO server is initialized (check server logs)

### Events Not Received

1. Verify user role has access to the room
2. Check that events are being emitted (check server logs)
3. Verify Socket.IO connection is established (check connection status)

### Production Deployment

For production:
1. Set `NEXT_PUBLIC_SOCKET_URL` to your production URL
2. Ensure WebSocket connections are allowed by your hosting provider
3. Configure CORS if needed in `lib/socket.js`
4. Use a reverse proxy (nginx) if needed for WebSocket support

## Security Considerations

1. **Authentication**: Socket.IO connections should be authenticated
2. **Room Access**: Users can only join rooms based on their roles
3. **Event Validation**: All events are validated before emission
4. **CORS**: CORS is configured to only allow requests from the app origin

## Performance

- Events are only emitted to relevant rooms
- Client-side filtering reduces unnecessary updates
- Automatic reconnection prevents data loss
- Efficient WebSocket transport reduces latency
