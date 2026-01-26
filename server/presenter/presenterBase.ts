import type { Request, Response, NextFunction } from 'express'

export default abstract class PresenterBase<T> {
  constructor() {}

  abstract buildPageContent(res: Response): T

  // For now returns the raw string, in future will return a computed path
  abstract getTemplatePath(): string

  abstract renderPage(res: Response, req: Request, next: NextFunction): void
}
