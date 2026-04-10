export interface paths {
  '/api/agencies/prisons': {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    /** Get list of prisons */
    get: operations['getPrisons']
    put?: never
    post?: never
    delete?: never
    options?: never
    head?: never
    patch?: never
    trace?: never
  }
}
export interface components {
  schemas: {
    Prison: {
      agencyId: string
      description: string
      longDescription: string
      agencyType: string
      active: boolean
    }
  }
  responses: never
  parameters: never
  requestBodies: never
  headers: never
  pathItems: never
}
export interface operations {
  getPrisons: {
    parameters: {
      query?: never
      header?: never
      path?: never
      cookie?: never
    }
    requestBody?: never
    responses: {
      /** @description Returns the list of Prison Information. */
      200: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': Prison[]
        }
      }
      /** @description Invalid request */
      400: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': unknown
        }
      }
      /** @description Reqiested respirce not found */
      404: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': unknown
        }
      }
      /** @description Failed to retrieve Probation Offices Information */
      500: {
        headers: {
          [name: string]: unknown
        }
        content: {
          'application/json': unknown
        }
      }
    }
  }
}
