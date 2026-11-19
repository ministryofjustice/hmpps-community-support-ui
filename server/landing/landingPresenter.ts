import PresenterBase from '../presenter/presenterBase'
import { LandingViewModel } from './landingViewModel'

export default class LandingPresenter extends PresenterBase<LandingViewModel> {
  protected override buildViewModel(): LandingViewModel {
    const content = this.globalContent().landing

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
