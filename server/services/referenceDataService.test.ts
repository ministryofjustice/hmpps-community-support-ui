import { ProbationOffice } from '@community-support-api'
import { Prison } from '@prison-api'
import CommunitySupportApiClient from '../data/communitySupportApiClient'
import PrisonApiClient from '../data/prisonApiClient'
import ReferenceDataService from './referenceDataService'

jest.mock('../data/communitySupportApiClient.ts')
jest.mock('../data/prisonApiClient.ts')

describe('ReferenceDataService', () => {
  let referenceDataService: ReferenceDataService

  const communitySupportApiClient = new CommunitySupportApiClient(null) as jest.Mocked<CommunitySupportApiClient>
  const prisonApiClient = new PrisonApiClient(null) as jest.Mocked<PrisonApiClient>

  beforeEach(() => {
    referenceDataService = new ReferenceDataService(communitySupportApiClient, prisonApiClient)
  })

  describe('getProbationOffices', () => {
    it('should return list of probation offices', async () => {
      const mockProbationOffices = [
        {
          probationOfficeId: 1,
          name: 'Derby: Derwent Centre',
          address: 'Derwent Centre, 1 Stuart Street, Derby, DE1 2EQ',
          probationRegionId: 'F',
          govUkUrl: 'https://www.gov.uk/guidance/derby-derwent-centre',
        },
        {
          probationOfficeId: 5,
          name: 'Leicestershire: Coalville Probation Office',
          address: 'Probation Office, 27 London Road, Coalville, Leicestershire, LE67 3JB"',
          probationRegionId: 'F',
          govUkUrl: 'https://www.gov.uk/guidance/leicestershire-coalville-probation-office',
          deliusCRSLocationId: 'CRS0086',
        },
        {
          probationOfficeId: 128,
          name: 'Warrington: Warrington Probation Office',
          address: 'Units 3 & 4 Bankside, Crosfield Street, Warrington, WA1 1UP',
          probationRegionId: 'B',
          deliusCRSLocationId: 'CRS0328',
        },
      ] satisfies ProbationOffice[]
      communitySupportApiClient.getProbationOffices.mockResolvedValue(mockProbationOffices)
      const result = await referenceDataService.getProbationOffices()
      expect(result).toBe(mockProbationOffices)
    })
  })

  describe('getPrisons', () => {
    it('should return list of prisons', async () => {
      const mockPrisons = [
        {
          agencyId: 'ALI',
          description: 'Albany (HMP)',
          longDescription: 'HMP ALBANY',
          agencyType: 'INST',
          active: true,
        },
        {
          agencyId: 'ACI',
          description: 'Altcourse (HMP)',
          longDescription: 'HMP ALTCOURSE',
          agencyType: 'INST',
          active: true,
        },
        {
          agencyId: 'ASI',
          description: 'Ashfield (HMP)',
          longDescription: 'HMP & YOI ASHFIELD',
          agencyType: 'INST',
          active: true,
        },
      ] satisfies Prison[]
      prisonApiClient.getPrisons.mockResolvedValue(mockPrisons)
      const result = await referenceDataService.getPrisons()
      expect(result).toBe(mockPrisons)
    })
  })
})
