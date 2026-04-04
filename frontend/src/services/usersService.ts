import { http, httpList, toQuery } from "../lib/http";
import { User, UserCreate, UserUpdate } from "@/types/User";

const BASE_PATH = "/users";

export const usersApi = {
  list: (q = "", page = 1, limit = 10) =>  httpList<User>(`${BASE_PATH}${toQuery({ q, page, limit })}`, page, limit),
  //list: () => http<User[]>(`${BASE_PATH}`, { method: "GET", auth: true }),

  create: (payload: UserCreate) =>
    http<User>(`${BASE_PATH}`, {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    }),

  update: (id: number, payload: UserUpdate) =>
    http<User>(`${BASE_PATH}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      auth: true,
    }),

  remove: (id: number) =>
    http(`${BASE_PATH}/${id}`, { method: "DELETE", auth: true }),

  changePassword: (id: number, password: string) =>
    http<void>(`${BASE_PATH}/${id}/password`, {
      method: "PATCH",
      body: JSON.stringify({password}),
      auth: true,
    })
};
