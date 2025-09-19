import axios from "axios"
import type { ActivityRecord } from "./types"
import { requestWithRotation } from "./crudcrud"

type CrudCrudActivity = Omit<ActivityRecord, "id"> & { _id: string }

function mapFromCrud(a: CrudCrudActivity): ActivityRecord {
  return {
    id: a._id,
    type: a.type,
    description: a.description,
    user: a.user,
    timestamp: a.timestamp,
    status: a.status,
  }
}

export const historyApi = {
  async list(): Promise<ActivityRecord[]> {
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/history`
      const res = await axios.get<CrudCrudActivity[]>(url)
      return res.data
    })
    return data.map(mapFromCrud)
  },

  async create(activity: Omit<ActivityRecord, "id">): Promise<ActivityRecord> {
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/history`
      const res = await axios.post<CrudCrudActivity>(url, activity)
      return res.data
    })
    return mapFromCrud(data)
  },
}
