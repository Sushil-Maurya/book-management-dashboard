import axios from "axios"
import type { Member, MemberFormData } from "./types"
import { requestWithRotation } from "./crudcrud"

type CrudCrudMember = Omit<Member, "id"> & { _id: string }

function mapFromCrud(m: CrudCrudMember): Member {
  return {
    id: m._id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    status: m.status,
    joinDate: m.joinDate,
    booksIssued: Number(m.booksIssued ?? 0),
  }
}

export const membersApi = {
  async list(): Promise<Member[]> {
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/members`
      const res = await axios.get<CrudCrudMember[]>(url)
      return res.data
    })
    return data.map(mapFromCrud)
  },

  async create(payload: MemberFormData): Promise<Member> {
    const body = {
      ...payload,
      joinDate: new Date().toISOString().slice(0, 10),
      booksIssued: 0,
    }
    const data = await requestWithRotation(async (base) => {
      const url = `${base}/members`
      const res = await axios.post<CrudCrudMember>(url, body)
      return res.data
    })
    return mapFromCrud(data)
  },

  async update(id: string, payload: Partial<MemberFormData>): Promise<Member> {
    return await requestWithRotation(async (base) => {
      const getUrl = `${base}/members/${id}`
      const current = await axios.get<CrudCrudMember>(getUrl)
      const updated = { ...current.data, ...payload }
      const { _id, ...putBody } = updated as any
      const putUrl = `${base}/members/${id}`
      await axios.put(putUrl, putBody)
      return mapFromCrud({ ...(putBody as any), _id: id })
    })
  },

  async remove(id: string): Promise<void> {
    await requestWithRotation(async (base) => {
      const url = `${base}/members/${id}`
      await axios.delete(url)
      return null as any
    })
  },
}
