import axios from "axios"
import type { ReportData } from "./types"

const BASE_URL = "https://crudcrud.com/api/9e96800dde894c34a47a7d602bbff73e"
const REPORTS_ENDPOINT = `${BASE_URL}/reports`

type CrudCrudReport = Omit<ReportData, "id"> & { _id: string }

function mapFromCrud(r: CrudCrudReport): ReportData {
  return {
    id: r._id,
    title: r.title,
    type: r.type,
    generatedDate: r.generatedDate,
    status: r.status,
  }
}

export const reportsApi = {
  async list(): Promise<ReportData[]> {
    const { data } = await axios.get<CrudCrudReport[]>(REPORTS_ENDPOINT)
    return data.map(mapFromCrud)
  },

  async create(payload: Omit<ReportData, "id">): Promise<ReportData> {
    const { data } = await axios.post<CrudCrudReport>(REPORTS_ENDPOINT, payload)
    return mapFromCrud(data)
  },

  async update(id: string, payload: Partial<Omit<ReportData, "id">>): Promise<ReportData> {
    const current = await axios.get<CrudCrudReport>(`${REPORTS_ENDPOINT}/${id}`)
    const updated = { ...current.data, ...payload }
    const { _id, ...putBody } = updated
    await axios.put(`${REPORTS_ENDPOINT}/${id}`, putBody)
    return mapFromCrud({ ...(putBody as any), _id: id })
  },
}
