import axios from "axios"
import type { ActivityRecord } from "./types"

const BASE_URL = "https://crudcrud.com/api/9e96800dde894c34a47a7d602bbff73e"
const HISTORY_ENDPOINT = `${BASE_URL}/history`

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
    const { data } = await axios.get<CrudCrudActivity[]>(HISTORY_ENDPOINT)
    return data.map(mapFromCrud)
  },

  async create(activity: Omit<ActivityRecord, "id">): Promise<ActivityRecord> {
    const { data } = await axios.post<CrudCrudActivity>(HISTORY_ENDPOINT, activity)
    return mapFromCrud(data)
  },
}
