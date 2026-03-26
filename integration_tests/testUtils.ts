import { Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import hmppsAuth, { type UserToken } from './mockApis/hmppsAuth'
import { resetStubs } from './mockApis/wiremock'

export { resetStubs }

const DEFAULT_ROLES = ['ROLE_COMMUNITY_SUPPORT_REFERRER', 'ROLE_COMMUNITY_SUPPORT_PROVIDER']

export const attemptHmppsAuthLogin = async (page: Page) => {
  await page.goto('/')
  page.locator('h1', { hasText: 'Sign in' })
  const url = await hmppsAuth.getSignInUrl()
  await page.goto(url)
}

export const login = async (
  page: Page,
  { name, roles = DEFAULT_ROLES, active = true, authSource = 'nomis' }: UserToken & { active?: boolean } = {},
) => {
  await Promise.all([
    hmppsAuth.favicon(),
    hmppsAuth.stubSignInPage(),
    hmppsAuth.stubSignOutPage(),
    hmppsAuth.token({ name, roles, authSource }),
    tokenVerification.stubVerifyToken(active),
  ])
  await attemptHmppsAuthLogin(page)
}

export const seedAppointmentSession = async (page: Page, appointmentRequest: object): Promise<void> => {
  await page.request.post('/test/setup-appointment-session', {
    data: appointmentRequest,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const seedReferralInformation = async (page: Page, referralInformation: object): Promise<void> => {
  await page.request.post('/test/setup-referral-information', {
    data: referralInformation,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const duplicateData = (dataToDuplicate: unknown, timesToDuplicates: number): Array<unknown> => {
  const duplicatedData = []
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < timesToDuplicates; i++) {
    duplicatedData.push(dataToDuplicate)
  }
  return duplicatedData
}
