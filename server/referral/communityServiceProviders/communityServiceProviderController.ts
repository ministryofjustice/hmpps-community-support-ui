import { Request, Response, NextFunction } from 'express'
import CommunityServiceProviderService from '../../services/communityServiceProviderService'
import CommunityServiceProviderPresenter from './communityServiceProviderPresenter'
import ViewUtils from '../../utils/viewUtils'
import { GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '../../@types/govukFrontend'

class CommunityServiceProviderController {
  constructor(private readonly communityServiceProviderService: CommunityServiceProviderService) {}

  async showCommunityServiceProviderPage(req: Request, res: Response) {
    const { personDetailsId } = req.params as { personDetailsId: string }
    const { username } = res.locals.user
    const communitySupportServiceProviders = await this.communityServiceProviderService.getCommunityServiceProviders(
      personDetailsId,
      username,
    )

    const presenter = new CommunityServiceProviderPresenter(communitySupportServiceProviders.communitySupportServices)
    return presenter.renderPage(res)
  }

  static summaryListArgs(items: GovukFrontendSummaryListRow[]): GovukFrontendSummaryList {
    return {
      ...ViewUtils.summaryList(items),
      classes: 'govuk-summary-list--no-border refer-and-monitor__intervention-summary-list',
    }
  }
}

export default CommunityServiceProviderController
