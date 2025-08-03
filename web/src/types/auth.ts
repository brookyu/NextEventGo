export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  role: 'admin' | 'manager' | 'user'
  permissions: string[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken?: string
  expiresIn: number
}

export interface AuthError {
  message: string
  code?: string
  field?: string
}
