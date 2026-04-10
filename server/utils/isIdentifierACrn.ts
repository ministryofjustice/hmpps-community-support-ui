const isIdentifierACrn = (id: string): boolean => /^[A-Z]\d{6}$/.test(id.trim().toUpperCase())
export default isIdentifierACrn
