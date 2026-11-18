import type { Response } from 'express'
import { globalContent, GlobalContent } from '../../assets/content/GlobalContent'

export default abstract class PresenterBase<PageViewModel> {
  constructor() {}

  protected abstract buildViewModel(res: Response): PageViewModel

  // For now returns the raw string, in future will return a computed path
  protected abstract getTemplatePath(): string

  protected buildStaticContent(): GlobalContent {
    return globalContent
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), {
      content: this.buildViewModel(res),
    })
  }
}
