import type { ReferralDetailsResponseDto, CaseWorkerDto } from '@community-support-api'

export function referralPageData(
  id: string | null,
  personNumber: string = 'CRN123',
  assignedTo: CaseWorkerDto[] = [],
): ReferralDetailsResponseDto {
  return {
    id: id || '{{request.path.[3]}}',
    referenceNumber: 'QD0878DE',
    createdDate: '2026-02-10T11:23:00.780Z',
    personDetailsTableData: {
      name: 'John Doe',
      dateOfBirth: '1973-02-10T11:23:00.780Z',
      preferredLanguage: 'English',
      disabilities: 'None',
      crn: personNumber,
    },
    equalityDetailsTableData: {
      ethnicity: 'White British',
      religionOrBelief: 'Chistian',
      sex: 'Male',
    },
    contactDetailsTableData: {
      phoneNumber: '01234567890',
      mobileNumber: '09876543210',
      email: 'john.doe@test.com',
      address: '10 Main Street, London, AA1 1AA',
    },
    referralDetailsTableData: {
      referralDate: '2026-05-09T11:23:00.780Z',
      assignedTo,
    },
  }
}
export default referralPageData
