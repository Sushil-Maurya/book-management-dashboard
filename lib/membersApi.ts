import axios from "axios"
import type { Member, MemberFormData } from "./types"

const BASE_URL = "https://crudcrud.com/api/9e96800dde894c34a47a7d602bbff73e"
const MEMBERS_ENDPOINT = `${BASE_URL}/members`

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
    const { data } = await axios.get<CrudCrudMember[]>(MEMBERS_ENDPOINT)
    return data.map(mapFromCrud)
  },

  async create(payload: MemberFormData): Promise<Member> {
    const body = {
      ...payload,
      joinDate: new Date().toISOString().slice(0, 10),
      booksIssued: 0,
    }
    const { data } = await axios.post<CrudCrudMember>(MEMBERS_ENDPOINT, body)
    return mapFromCrud(data)
  },

  async update(id: string, payload: Partial<MemberFormData>): Promise<Member> {
    const current = await axios.get<CrudCrudMember>(`${MEMBERS_ENDPOINT}/${id}`)
    const updated = { ...current.data, ...payload }
    const { _id, ...putBody } = updated
    await axios.put(`${MEMBERS_ENDPOINT}/${id}`, putBody)
    return mapFromCrud({ ...(putBody as any), _id: id })
  },

  async remove(id: string): Promise<void> {
    await axios.delete(`${MEMBERS_ENDPOINT}/${id}`)
  },
}
