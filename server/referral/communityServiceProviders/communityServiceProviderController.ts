import { Request, Response } from 'express'
import CommunityServiceProviderService from '../../services/communityServiceProviderService'
import CommunityServiceProviderPresenter2 from './communityServiceProviderPresenter2'

class CommunityServiceProviderController {
  constructor(private readonly communityServiceProviderService: CommunityServiceProviderService) {}

  async showCommunityServiceProviderPage(req: Request, res: Response) {
    const personDetailsId = req.session?.personId
    const { username } = res.locals.user
    const communitySupportServiceProviders = await this.communityServiceProviderService.getCommunityServiceProviders(
      personDetailsId,
      username,
    )

    const presenter = new CommunityServiceProviderPresenter2(communitySupportServiceProviders.communitySupportServices)
    return presenter.renderPage(res)
  }
}

export default CommunityServiceProviderController
