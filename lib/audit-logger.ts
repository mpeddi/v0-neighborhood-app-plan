/**
 * Audit Logging Utility
 * Tracks all admin actions for security and compliance
 */

import { createServiceClient } from "@/lib/supabase/server"

export interface AuditLogEntry {
  admin_id: string
  action: 'create' | 'update' | 'delete'
  resource_type: string
  resource_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  description: string
}

export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createServiceClient()

    await supabase
      .from('audit_logs')
      .insert({
        admin_id: entry.admin_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        old_values: entry.old_values || null,
        new_values: entry.new_values || null,
        description: entry.description,
        created_at: new Date().toISOString(),
      })
  } catch (error) {
    // Log to console but don't throw - we don't want audit logging failures to break operations
    console.error('[v0] Audit logging failed:', error)
  }
}

/**
 * Helper to create descriptive audit log messages
 */
export function createAuditDescription(action: string, resourceType: string, details: string): string {
  return `${action.charAt(0).toUpperCase() + action.slice(1)} ${resourceType}: ${details}`
}
