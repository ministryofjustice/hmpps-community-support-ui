import type { Request, Response, NextFunction } from 'express'

export default abstract class PresenterBase<T> {
  constructor() {}

  protected buildPageContent(res: Response): T {
    return this.buildPageContent(res)
  }

  // For now returns the raw string, in future will return a computed path
  protected getTemplatePath(): string {
    throw new Error('This method must be overridden by subclasses')
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), {
      content: this.buildPageContent(res),
    })
  }
}
