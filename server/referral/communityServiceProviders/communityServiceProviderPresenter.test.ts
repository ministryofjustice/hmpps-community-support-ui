import { Response } from 'express'
import { CommunitySupportServiceProviders } from '@community-support-api'
import CommunityServiceProviderPresenter from './communityServiceProviderPresenter'
import CommunityServiceProviderContentFactory from '../../testutils/factories/CommunityServiceProvidersContent'
import { CommunityServiceProviderContent, CommunityServiceProviderViewModel } from './communityServiceProvidersModel'

describe('CommunityServiceProviderPresenter', () => {
  let res: Response
  let content: CommunityServiceProviderContent
  beforeEach(() => {
    content = CommunityServiceProviderContentFactory.build()
    res = {
      locals: { content },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })
  describe('renderPage', () => {
    it('should render the found person page with the correct content and summary list', () => {
      const CommunityServiceProviders: CommunitySupportServiceProviders[] = [
        {
          id: 'service1',
          region: 'Region 1',
          name: 'Service 1',
          providerName: 'Provider 1',
          description: 'Description for Service 1',
        } as CommunitySupportServiceProviders,
      ]
      const presenter = new CommunityServiceProviderPresenter(CommunityServiceProviders)
      presenter.renderPage(res)
      expect(res.render).toHaveBeenCalledWith(
        'communityServiceProviders/providers',
        expect.objectContaining({} as CommunityServiceProviderViewModel),
      )
    })
  })
})
