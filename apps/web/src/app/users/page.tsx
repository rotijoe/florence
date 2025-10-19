'use client'

import { useEffect, useState } from 'react'
import type { User, ApiResponse } from '@packages/types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data: ApiResponse<User[]>) => {
        if (data.success) setUsers(data.data)
      })
      .catch((error) => {
        console.error('Fetch error:', error)
      })
  }, [])

  return (
    <main>
      <h1>Users</h1>
      <ul>
        {users.map((u) => (
          <li key={u.id}>{u.email}</li>
        ))}
      </ul>
    </main>
  )
}
