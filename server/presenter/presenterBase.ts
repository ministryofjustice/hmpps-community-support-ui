import type { Response } from 'express'
import { GlobalContent } from '../../assets/content/GlobalContent'

export default abstract class PresenterBase<PageViewModel, StaticContentType = GlobalContent> {
  constructor() {}

  protected abstract buildViewModel(res: Response): PageViewModel

  // For now returns the raw string, in future will return a computed path
  protected abstract getTemplatePath(): string

  protected buildStaticContent(res: Response): StaticContentType {
    const { content } = res.locals
    return content as StaticContentType
  }

  renderPage(res: Response): void {
    return res.render(this.getTemplatePath(), {
      content: this.buildViewModel(res),
    })
  }
}
