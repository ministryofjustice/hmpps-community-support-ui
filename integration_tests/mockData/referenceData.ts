import type { ProbationOffice } from '@community-support-api'
import type { Prison } from '@prison-api'

const mockProbationOfficesData: ProbationOffice[] = [
  {
    probationOfficeId: 1,
    name: 'Derby: Probation Centre 1',
    address: 'Probation Centre, 1 Testing Street, Derby, DE1 1ED',
    probationRegionId: 'F',
    govUkUrl: 'https://not.a.real.domain/guidance/derby-probation-centre-1',
  },
  {
    probationOfficeId: 2,
    name: 'Derbyshire: Probation Center 2',
    address: 'Probation Office, 2 Testing Street, Derbyshire, SK1 1KS',
    probationRegionId: 'F',
    govUkUrl: 'https://not.a.real.domain/guidance/derbyshire-probation-centre-2',
    deliusCRSLocationId: 'CRS9999',
  },
  {
    probationOfficeId: 3,
    name: 'Derbyshire: Probation Center 3',
    address: 'Probation Office, 3 Testing Road, Derbyshire, S1 1UG',
    probationRegionId: 'F',
    govUkUrl: 'https://not.a.real.domain/guidance/derbyshire-probation-centre-3',
  },
  {
    probationOfficeId: 4,
    name: 'Leicestershire: Probation Center 4',
    address: 'Probation Office, 4 Testing Road, Leicestershire, LE1 1EL',
    probationRegionId: 'F',
    govUkUrl: 'https://not.a.real.domain/guidance/leicestershire-probation-centre-4',
  },
]

const mockPrisonsData: Prison[] = [
  {
    agencyId: 'PR1',
    description: 'Prison 1',
    longDescription: 'PRISON 1',
    agencyType: 'INST',
    active: true,
  },
  {
    agencyId: 'PR2',
    description: 'Prison 2',
    longDescription: 'PRISON 2',
    agencyType: 'INST',
    active: true,
  },
  {
    agencyId: 'PR3',
    description: 'Prison 3',
    longDescription: 'PRISON 3',
    agencyType: 'INST',
    active: true,
  },
]

export { mockPrisonsData as prisonsData, mockProbationOfficesData as probationOfficesData }
