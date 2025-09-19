import axios from "axios"
import type { ReportData } from "./types"
import { requestWithRotation } from "./crudcrud"

type CrudCrudReport = Omit<ReportData, "id"> & { _id: string }

function mapFromCrud(r: CrudCrudReport): ReportData {
  // Ensure required fields have defaults if missing
  return {
    id: r._id || Math.random().toString(36).substr(2, 9), // Fallback ID if not provided
    title: r.title || 'Untitled Report',
    type: r.type || 'PDF',
    generatedDate: r.generatedDate || new Date().toISOString().slice(0, 10),
    status: r.status || 'Pending',
  }
}

export const reportsApi = {
  async list(): Promise<ReportData[]> {
    try {
      const data = await requestWithRotation(async (base) => {
        const url = `${base}/reports`
        const res = await axios.get<CrudCrudReport[]>(url)
        return res.data || []
      })
      return data.map(mapFromCrud)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      return []
    }
  },

  async create(payload: Omit<ReportData, "id">): Promise<ReportData> {
    try {
      const data = await requestWithRotation(async (base) => {
        const url = `${base}/reports`
        const res = await axios.post<CrudCrudReport>(url, {
          ...payload,
          generatedDate: payload.generatedDate || new Date().toISOString().slice(0, 10),
          status: 'Generating',
        })
        return res.data
      })
      return mapFromCrud(data)
    } catch (error) {
      console.error('Failed to create report:', error)
      throw error
    }
  },

  async update(id: string, payload: Partial<Omit<ReportData, "id">>): Promise<ReportData> {
    try {
      const data = await requestWithRotation(async (base) => {
        const url = `${base}/reports/${id}`
        // Get current data
        const current = await axios.get<CrudCrudReport>(url)
        const updated = { ...current.data, ...payload }
        const { _id, ...putBody } = updated
        
        // Update the record
        await axios.put(`${base}/reports/${id}`, putBody)
        return { ...(putBody as any), _id: id }
      })
      return mapFromCrud(data)
    } catch (error) {
      console.error('Failed to update report:', error)
      throw error
    }
  },
}