export interface Success {
  success: true
}

export interface Error {
  success: false
  errors: string | string[]
}

export type Validation = Success | Error
