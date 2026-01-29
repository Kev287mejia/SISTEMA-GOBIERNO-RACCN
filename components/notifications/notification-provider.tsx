"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { NotificationListener } from './notification-listener'
import { Toaster } from 'sonner'

const NotificationContext = createContext({})

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NotificationContext.Provider value={{}}>
      <NotificationListener />
      {children}
      <Toaster position="top-right" closeButton richColors />
    </NotificationContext.Provider>
  )
}
