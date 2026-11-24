import type { Response } from 'express'
import { globalContent, GlobalContent } from '../../assets/content/GlobalContent'

export default abstract class PresenterBase<PageViewModel> {
  constructor() {}

  protected abstract buildViewModel(res: Response): PageViewModel

  // For now returns the raw string, in future will return a computed path
  protected abstract getTemplatePath(): string

  protected globalContent(): GlobalContent {
    return globalContent
  }

  /** Resolves a dot-separated path within global content. */
  protected getPageContent<Content = unknown>(pageRoute: string): Content | undefined {
    return pageRoute.split('.').reduce<unknown>((current, segment) => {
      if (!current || typeof current !== 'object' || !Object.hasOwn(current, segment)) {
        return undefined
      }
      return (current as Record<string, unknown>)[segment]
    }, this.globalContent()) as Content | undefined
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), {
      content: this.buildViewModel(res),
    })
  }
}
