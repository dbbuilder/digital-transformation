// Zustand Store for Global Application State

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Phase, Tier, ProjectStatus, TransformationPath } from '../types'

interface AppState {
  // Current context
  currentProjectId: number | null
  setCurrentProjectId: (id: number | null) => void

  // UI state
  activeTab: 'home' | 'projects' | 'about' | 'assessments' | 'education'
  setActiveTab: (tab: 'home' | 'projects' | 'about' | 'assessments' | 'education') => void

  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Project filters
  projectSearchTerm: string
  setProjectSearchTerm: (term: string) => void

  projectStatusFilter: ProjectStatus | 'all'
  setProjectStatusFilter: (status: ProjectStatus | 'all') => void

  projectPathFilter: TransformationPath | 'all'
  setProjectPathFilter: (path: TransformationPath | 'all') => void

  // Assessment context
  selectedPhase: Phase | null
  setSelectedPhase: (phase: Phase | null) => void

  selectedTier: Tier | null
  setSelectedTier: (tier: Tier | null) => void

  // Modals & dialogs
  createProjectModalOpen: boolean
  setCreateProjectModalOpen: (open: boolean) => void

  emailDialogOpen: boolean
  setEmailDialogOpen: (open: boolean) => void

  exportDialogOpen: boolean
  setExportDialogOpen: (open: boolean) => void

  // Reset all filters
  resetFilters: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Current context
      currentProjectId: null,
      setCurrentProjectId: (id) => set({ currentProjectId: id }),

      // UI state
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Project filters
      projectSearchTerm: '',
      setProjectSearchTerm: (term) => set({ projectSearchTerm: term }),

      projectStatusFilter: 'all',
      setProjectStatusFilter: (status) => set({ projectStatusFilter: status }),

      projectPathFilter: 'all',
      setProjectPathFilter: (path) => set({ projectPathFilter: path }),

      // Assessment context
      selectedPhase: null,
      setSelectedPhase: (phase) => set({ selectedPhase: phase }),

      selectedTier: null,
      setSelectedTier: (tier) => set({ selectedTier: tier }),

      // Modals & dialogs
      createProjectModalOpen: false,
      setCreateProjectModalOpen: (open) => set({ createProjectModalOpen: open }),

      emailDialogOpen: false,
      setEmailDialogOpen: (open) => set({ emailDialogOpen: open }),

      exportDialogOpen: false,
      setExportDialogOpen: (open) => set({ exportDialogOpen: open }),

      // Reset all filters
      resetFilters: () =>
        set({
          projectSearchTerm: '',
          projectStatusFilter: 'all',
          projectPathFilter: 'all',
          selectedPhase: null,
          selectedTier: null,
        }),
    }),
    {
      name: 'app-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        currentProjectId: state.currentProjectId,
        sidebarOpen: state.sidebarOpen,
        activeTab: state.activeTab,
      }),
    }
  )
)
