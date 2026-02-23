'use client'

import { Suspense } from 'react'
import { AdminSetupContent } from './admin-setup-content'

export default function AdminSetupPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Verifying authorization...</p>
      </div>
    }>
      <AdminSetupContent />
    </Suspense>
  )
}
