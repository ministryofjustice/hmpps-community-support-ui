import { Request, Response, NextFunction } from 'express'
import CommunityServiceProviderService from '../../services/communityServiceProviderService'
import CommunityServiceProviderPresenter from './communityServiceProviderPresenter'
import ViewUtils from '../../utils/viewUtils'
import { GovukFrontendSummaryList, GovukFrontendSummaryListRow } from '../../@types/govukFrontend'

class CommunityServiceProviderController {
  constructor(private readonly communityServiceProviderService: CommunityServiceProviderService) {}

  async showCommunityServiceProviderPage(req: Request, res: Response, next: NextFunction) {
    const { personDetailsId } = req.params
    const { username } = res.locals.user
    const communitySupportServiceProviders = await this.communityServiceProviderService.getCommunityServiceProviders(
      personDetailsId,
      username,
    )
    const results: CommunityServiceProviderPresenter[] = communitySupportServiceProviders.communitySupportServices.map(
      provider => new CommunityServiceProviderPresenter(provider),
    )
    return res.render('communityServiceProviders/providers', {
      communityServiceProviderPresenter: results,
      summaryListArgs: CommunityServiceProviderController.summaryListArgs,
    })
  }

  static summaryListArgs(items: GovukFrontendSummaryListRow[]): GovukFrontendSummaryList {
    return {
      ...ViewUtils.summaryListArgs(items),
      classes: 'govuk-summary-list--no-border refer-and-monitor__intervention-summary-list',
    }
  }
}

export default CommunityServiceProviderController
