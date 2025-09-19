import axios from "axios"
import type { ActivityRecord } from "./types"
import { requestWithRotation } from "./crudcrud"

type CrudCrudActivity = Omit<ActivityRecord, "id"> & { _id: string }

function mapFromCrud(a: CrudCrudActivity): ActivityRecord {
  // Ensure required fields have defaults if missing
  const now = new Date().toISOString()
  return {
    id: a._id || Math.random().toString(36).substr(2, 9),
    type: a.type || 'Activity',
    description: a.description || 'No description provided',
    user: a.user || 'System',
    status: a.status || 'Success',
    timestamp: a.timestamp || now,
  }
}

export const historyApi = {
  async list(): Promise<ActivityRecord[]> {
    try {
      const data = await requestWithRotation(async (base) => {
        const url = `${base}/history`
        const res = await axios.get<CrudCrudActivity[]>(url)
        return res.data || []
      })
      // Sort by timestamp descending (newest first)
      return data
        .map(mapFromCrud)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('Failed to fetch history:', error)
      return []
    }
  },

  async create(activity: Omit<ActivityRecord, "id">): Promise<ActivityRecord> {
    try {
      const data = await requestWithRotation(async (base) => {
        const url = `${base}/history`
        const payload = {
          ...activity,
          timestamp: activity.timestamp || new Date().toISOString(),
        }
        const res = await axios.post<CrudCrudActivity>(url, payload)
        return res.data
      })
      return mapFromCrud(data)
    } catch (error) {
      console.error('Failed to create history record:', error)
      // Return a local record if API fails
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...activity,
        timestamp: activity.timestamp || new Date().toISOString(),
      }
    }
  },

  async logBorrow(bookTitle: string, userName: string): Promise<ActivityRecord> {
    return this.create({
      type: "Borrow",
      description: `${userName} borrowed "${bookTitle}"`,
      user: userName,
      status: "Success",
      timestamp: new Date().toISOString(),
    })
  },

  async logReturn(bookTitle: string, userName: string): Promise<ActivityRecord> {
    return this.create({
      type: "Return",
      description: `${userName} returned "${bookTitle}"`,
      user: userName,
      status: "Success",
      timestamp: new Date().toISOString(),
    })
  },

  async logMemberRegistration(userName: string): Promise<ActivityRecord> {
    return this.create({
      type: "Register",
      description: `New member registered: ${userName}`,
      user: userName,
      status: "Success",
      timestamp: new Date().toISOString(),
    })
  },
}