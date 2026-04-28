export interface Success {
  success: true
}

export interface Error {
  success: false
  errors: true
}

export type Validation = Success | Error
