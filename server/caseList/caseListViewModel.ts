import { GovukFrontendBackLink, GovukFrontendPagination, GovukFrontendTable } from '@govuk-frontend'
import { GlobalContent } from '../../assets/content/GlobalContent'
import { MojSubNavigation } from '../@types/mojFrontend'

export type CaseListViewModel = {
  staticContent: CaseListContent
  hasCases: boolean
  navBar: MojSubNavigation
  pagination: GovukFrontendPagination
  caseListTable: GovukFrontendTable
  noCasesTitle: string
  backLink: GovukFrontendBackLink
}

export type CaseListContent = GlobalContent['/unassigned-cases']

export type subNavItem = CaseListContent['subNavItems'][number]

export type CaseListCase = {
  name: string
  crnOrPrisonNumber: string
  caseWorkers: Array<string>
  dateReceived: string
  id: string
  caseIdentifier: string
}
