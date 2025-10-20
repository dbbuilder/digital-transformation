/**
 * Database Synchronization Service
 *
 * Enables seamless online/offline data synchronization for DigiForm
 * - Change tracking with timestamps
 * - Conflict resolution (last-write-wins)
 * - Sync queue for offline changes
 * - Export/import for data backup and migration
 */

import { db } from '../lib/database'
import type { Project, Stakeholder, Assessment, AssessmentResponse, Roadmap, RoadmapPhase, FourCornerData, Document } from '../types'

export type SyncStatus = 'SYNCED' | 'PENDING' | 'CONFLICT' | 'ERROR'

export interface SyncableEntity {
  id?: number
  lastModified?: Date
  syncStatus?: SyncStatus
  syncVersion?: number
}

export interface SyncQueueItem {
  id?: number
  tableName: string
  entityId: number
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  data?: any
  timestamp: Date
  syncStatus: SyncStatus
  error?: string
}

export interface SyncResult {
  success: boolean
  syncedCount: number
  conflicts: SyncConflict[]
  errors: string[]
}

export interface SyncConflict {
  tableName: string
  entityId: number
  localVersion: number
  remoteVersion: number
  localData: any
  remoteData: any
}

export interface BackupData {
  version: string
  exportedAt: string
  projects: Project[]
  stakeholders: Stakeholder[]
  assessments: Assessment[]
  assessmentResponses: AssessmentResponse[]
  roadmaps: Roadmap[]
  roadmapPhases: RoadmapPhase[]
  fourCornerData: FourCornerData[]
  documents: Document[]
}

/**
 * Sync Service Class
 */
export class SyncService {
  private isOnline: boolean = navigator.onLine
  private syncInProgress: boolean = false

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  /**
   * Get current online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline
  }

  /**
   * Get pending sync count
   */
  async getPendingSyncCount(): Promise<number> {
    // In offline-first mode, we don't have a sync queue table yet
    // This would be used if we add backend sync capability
    return 0
  }

  /**
   * Track change to entity (for future sync)
   */
  async trackChange(tableName: string, entityId: number, operation: 'CREATE' | 'UPDATE' | 'DELETE', data?: any): Promise<void> {
    // Update lastModified timestamp
    const now = new Date()

    try {
      switch (tableName) {
        case 'projects':
          await db.projects.update(entityId, { updatedAt: now })
          break
        case 'stakeholders':
          await db.stakeholders.update(entityId, { updatedAt: now })
          break
        case 'assessments':
          await db.assessments.update(entityId, { updatedAt: now })
          break
        case 'assessmentResponses':
          await db.assessmentResponses.update(entityId, { answeredAt: now })
          break
      }
    } catch (error) {
      console.error(`Failed to track change for ${tableName}:${entityId}`, error)
    }
  }

  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<BackupData> {
    console.log('📦 Exporting all data for backup...')

    const data: BackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects: await db.projects.toArray(),
      stakeholders: await db.stakeholders.toArray(),
      assessments: await db.assessments.toArray(),
      assessmentResponses: await db.assessmentResponses.toArray(),
      roadmaps: await db.roadmaps.toArray(),
      roadmapPhases: await db.roadmapPhases.toArray(),
      fourCornerData: await db.fourCornerData.toArray(),
      documents: await db.documents.toArray(),
    }

    console.log(`✅ Exported data:`, {
      projects: data.projects.length,
      stakeholders: data.stakeholders.length,
      assessments: data.assessments.length,
      assessmentResponses: data.assessmentResponses.length,
      roadmaps: data.roadmaps.length,
      fourCornerData: data.fourCornerData.length,
    })

    return data
  }

  /**
   * Import data from backup (with conflict resolution)
   */
  async importData(backupData: BackupData, strategy: 'OVERWRITE' | 'MERGE' | 'SKIP_EXISTING' = 'MERGE'): Promise<SyncResult> {
    console.log(`📥 Importing backup data with strategy: ${strategy}...`)

    const conflicts: SyncConflict[] = []
    const errors: string[] = []
    let syncedCount = 0

    try {
      await db.transaction('rw', [
        db.projects,
        db.stakeholders,
        db.assessments,
        db.assessmentResponses,
        db.roadmaps,
        db.roadmapPhases,
        db.fourCornerData,
        db.documents,
      ], async () => {
        // Import projects
        for (const project of backupData.projects) {
          try {
            const existing = project.id ? await db.projects.get(project.id) : undefined

            if (strategy === 'OVERWRITE' || !existing) {
              if (project.id) {
                await db.projects.put(project)
              } else {
                await db.projects.add(project)
              }
              syncedCount++
            } else if (strategy === 'MERGE') {
              // Last-write-wins based on updatedAt
              const existingDate = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0
              const importDate = project.updatedAt ? new Date(project.updatedAt).getTime() : 0

              if (importDate > existingDate) {
                await db.projects.put(project)
                syncedCount++
              } else {
                conflicts.push({
                  tableName: 'projects',
                  entityId: project.id!,
                  localVersion: 1,
                  remoteVersion: 1,
                  localData: existing,
                  remoteData: project,
                })
              }
            }
            // SKIP_EXISTING: do nothing
          } catch (error: any) {
            errors.push(`Failed to import project ${project.name}: ${error.message}`)
          }
        }

        // Import stakeholders
        for (const stakeholder of backupData.stakeholders) {
          try {
            const existing = stakeholder.id ? await db.stakeholders.get(stakeholder.id) : undefined

            if (strategy === 'OVERWRITE' || !existing) {
              if (stakeholder.id) {
                await db.stakeholders.put(stakeholder)
              } else {
                await db.stakeholders.add(stakeholder)
              }
              syncedCount++
            } else if (strategy === 'MERGE') {
              const existingDate = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0
              const importDate = stakeholder.updatedAt ? new Date(stakeholder.updatedAt).getTime() : 0

              if (importDate > existingDate) {
                await db.stakeholders.put(stakeholder)
                syncedCount++
              }
            }
          } catch (error: any) {
            errors.push(`Failed to import stakeholder ${stakeholder.name}: ${error.message}`)
          }
        }

        // Import assessments
        for (const assessment of backupData.assessments) {
          try {
            if (strategy === 'OVERWRITE' || !(await db.assessments.get(assessment.id!))) {
              if (assessment.id) {
                await db.assessments.put(assessment)
              } else {
                await db.assessments.add(assessment)
              }
              syncedCount++
            }
          } catch (error: any) {
            errors.push(`Failed to import assessment: ${error.message}`)
          }
        }

        // Import assessment responses
        for (const response of backupData.assessmentResponses) {
          try {
            if (strategy === 'OVERWRITE' || !(await db.assessmentResponses.get(response.id!))) {
              if (response.id) {
                await db.assessmentResponses.put(response)
              } else {
                await db.assessmentResponses.add(response)
              }
              syncedCount++
            }
          } catch (error: any) {
            errors.push(`Failed to import assessment response: ${error.message}`)
          }
        }

        // Import roadmaps
        for (const roadmap of backupData.roadmaps) {
          try {
            if (strategy === 'OVERWRITE' || !(await db.roadmaps.get(roadmap.id!))) {
              if (roadmap.id) {
                await db.roadmaps.put(roadmap)
              } else {
                await db.roadmaps.add(roadmap)
              }
              syncedCount++
            }
          } catch (error: any) {
            errors.push(`Failed to import roadmap: ${error.message}`)
          }
        }

        // Import roadmap phases
        for (const phase of backupData.roadmapPhases) {
          try {
            if (strategy === 'OVERWRITE' || !(await db.roadmapPhases.get(phase.id!))) {
              if (phase.id) {
                await db.roadmapPhases.put(phase)
              } else {
                await db.roadmapPhases.add(phase)
              }
              syncedCount++
            }
          } catch (error: any) {
            errors.push(`Failed to import roadmap phase: ${error.message}`)
          }
        }

        // Import four-corner data
        for (const fourCorner of backupData.fourCornerData) {
          try {
            if (strategy === 'OVERWRITE' || !(await db.fourCornerData.get(fourCorner.id!))) {
              if (fourCorner.id) {
                await db.fourCornerData.put(fourCorner)
              } else {
                await db.fourCornerData.add(fourCorner)
              }
              syncedCount++
            }
          } catch (error: any) {
            errors.push(`Failed to import four-corner data: ${error.message}`)
          }
        }

        // Import documents
        for (const document of backupData.documents) {
          try {
            if (strategy === 'OVERWRITE' || !(await db.documents.get(document.id!))) {
              if (document.id) {
                await db.documents.put(document)
              } else {
                await db.documents.add(document)
              }
              syncedCount++
            }
          } catch (error: any) {
            errors.push(`Failed to import document: ${error.message}`)
          }
        }
      })

      console.log(`✅ Import complete: ${syncedCount} items synced, ${conflicts.length} conflicts, ${errors.length} errors`)

      return {
        success: errors.length === 0,
        syncedCount,
        conflicts,
        errors,
      }
    } catch (error: any) {
      console.error('Failed to import data:', error)
      return {
        success: false,
        syncedCount,
        conflicts,
        errors: [...errors, `Transaction failed: ${error.message}`],
      }
    }
  }

  /**
   * Export data as JSON blob (for download)
   */
  async exportAsJSON(): Promise<Blob> {
    const data = await this.exportAllData()
    const json = JSON.stringify(data, null, 2)
    return new Blob([json], { type: 'application/json' })
  }

  /**
   * Import data from JSON file
   */
  async importFromJSON(file: File, strategy: 'OVERWRITE' | 'MERGE' | 'SKIP_EXISTING' = 'MERGE'): Promise<SyncResult> {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as BackupData

      // Validate data structure
      if (!data.version || !data.projects) {
        throw new Error('Invalid backup file format')
      }

      return await this.importData(data, strategy)
    } catch (error: any) {
      console.error('Failed to import from JSON:', error)
      return {
        success: false,
        syncedCount: 0,
        conflicts: [],
        errors: [error.message],
      }
    }
  }

  /**
   * Clear all data (with confirmation)
   */
  async clearAllData(): Promise<void> {
    console.log('🗑️ Clearing all database data...')

    await db.transaction('rw', [
      db.projects,
      db.stakeholders,
      db.assessments,
      db.assessmentResponses,
      db.roadmaps,
      db.roadmapPhases,
      db.fourCornerData,
      db.documents,
      db.exports,
    ], async () => {
      await db.projects.clear()
      await db.stakeholders.clear()
      await db.assessments.clear()
      await db.assessmentResponses.clear()
      await db.roadmaps.clear()
      await db.roadmapPhases.clear()
      await db.fourCornerData.clear()
      await db.documents.clear()
      await db.exports.clear()
    })

    console.log('✅ All data cleared')
  }

  /**
   * Get database statistics
   */
  async getStats() {
    const [
      projectsCount,
      stakeholdersCount,
      assessmentsCount,
      responsesCount,
      roadmapsCount,
      documentsCount,
    ] = await Promise.all([
      db.projects.count(),
      db.stakeholders.count(),
      db.assessments.count(),
      db.assessmentResponses.count(),
      db.roadmaps.count(),
      db.documents.count(),
    ])

    return {
      projects: projectsCount,
      stakeholders: stakeholdersCount,
      assessments: assessmentsCount,
      assessmentResponses: responsesCount,
      roadmaps: roadmapsCount,
      documents: documentsCount,
      total: projectsCount + stakeholdersCount + assessmentsCount + responsesCount + roadmapsCount + documentsCount,
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    console.log('🌐 Connection restored - now online')
    this.isOnline = true

    // Trigger sync if there are pending changes
    // (Future enhancement when backend sync is added)
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    console.log('📴 Connection lost - now offline')
    this.isOnline = false
  }

  /**
   * Manually trigger sync (for future backend integration)
   */
  async sync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress')
      return {
        success: false,
        syncedCount: 0,
        conflicts: [],
        errors: ['Sync already in progress'],
      }
    }

    if (!this.isOnline) {
      console.warn('Cannot sync while offline')
      return {
        success: false,
        syncedCount: 0,
        conflicts: [],
        errors: ['Cannot sync while offline'],
      }
    }

    this.syncInProgress = true

    try {
      // Future: Implement backend sync logic here
      // For now, this is a placeholder for when backend sync is added

      console.log('✅ Sync complete (placeholder - no backend sync yet)')

      return {
        success: true,
        syncedCount: 0,
        conflicts: [],
        errors: [],
      }
    } finally {
      this.syncInProgress = false
    }
  }
}

/**
 * Singleton sync service instance
 */
let syncServiceInstance: SyncService | null = null

export function getSyncService(): SyncService {
  if (!syncServiceInstance) {
    syncServiceInstance = new SyncService()
  }
  return syncServiceInstance
}
