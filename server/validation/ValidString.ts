import z from 'zod'

const maxCharacters = 65000 as const
const validString = (errorMessage: string) => z.string().max(maxCharacters, { error: errorMessage })
export default validString
