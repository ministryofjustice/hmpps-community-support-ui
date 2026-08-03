import { Response } from 'express'
import PresenterBase from '../presenter/presenterBase'
import { LandingContent, LandingViewModel } from './landingViewModel'

export default class LandingPresenter extends PresenterBase<LandingViewModel, LandingContent> {
  protected override buildViewModel(res: Response): LandingViewModel {
    const content = this.buildStaticContent(res)

    if (!content || !content.pageHeader || !Array.isArray(content.tiles)) {
      throw new Error('Landing content is missing or invalid for path /')
    }

    return {
      pageHeader: content.pageHeader,
      tiles: content.tiles,
    }
  }

  protected override getTemplatePath(): string {
    return 'pages/index.njk'
  }
}
