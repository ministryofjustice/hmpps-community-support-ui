import { Request, Response } from 'express'
import { CommunitySupportServicesProvider } from '@community-support-api'
import CommunityServiceProviderService from '../../services/communityServiceProviderService'
import CommunityServiceProviderController from './communityServiceProviderController'
import CommunityServiceProviderPresenter from './communityServiceProviderPresenter'

jest.mock('../../services/communityServiceProviderService')

describe('CommunityServiceProviderController', () => {
  let communityServiceProviderService: jest.Mocked<CommunityServiceProviderService>
  let communityServiceProviderController: CommunityServiceProviderController
  let req: Request
  let res: Response
  let next: jest.Mock

  beforeEach(() => {
    communityServiceProviderService = {
      getCommunityServiceProviders: jest.fn(),
    } as unknown as jest.Mocked<CommunityServiceProviderService>
    communityServiceProviderController = new CommunityServiceProviderController(communityServiceProviderService)

    req = {
      params: { personDetailsId: 'CRN123' },
    } as unknown as Request
    res = {
      locals: { user: { username: 'user1' } },
      render: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  describe('showCommunityServiceProviderPage', () => {
    it('should render community service provider page with community service provider data', async () => {
      const mockCommunityServiceProviderData = {
        personId: 'personDetails123',
        communitySupportServices: [
          { id: 'service1', region: 'Region 1', name: 'Service 1' },
          { id: 'service2', region: 'Region 2', name: 'Service 2' },
        ],
      } as CommunitySupportServicesProvider
      const results: CommunityServiceProviderPresenter[] =
        mockCommunityServiceProviderData.communitySupportServices.map(
          provider => new CommunityServiceProviderPresenter(provider),
        )
      communityServiceProviderService.getCommunityServiceProviders.mockResolvedValue(mockCommunityServiceProviderData)

      await communityServiceProviderController.showCommunityServiceProviderPage(req, res, next)

      expect(communityServiceProviderService.getCommunityServiceProviders).toHaveBeenCalledWith('CRN123', 'user1')
      expect(res.render).toHaveBeenCalledWith('communityServiceProviders/providers', {
        communityServiceProviderPresenter: results,
        summaryListArgs: CommunityServiceProviderController.summaryListArgs,
      })
    })
  })
})
