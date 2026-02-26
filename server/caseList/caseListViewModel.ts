import { GovukFrontendPagination, GovukFrontendTable } from '@govuk-frontend'
import { MojSubNavigation } from '../@types/mojFrontend'

export type CaseListViewModel = {
  staticContent: CaseListContent
  hasCases: boolean
  navBar: MojSubNavigation
  pagination: GovukFrontendPagination
  caseListTable: GovukFrontendTable
  noCasesTitle: string
}

export type CaseListContent = {
  pageHeader: string
  unassignedSubNavTitle: string
  inProgressSubNavTitle: string
  subNavItems: Array<subNavItem>
  unassignedColumnHeaders: Array<string>
  inProgressColumnHeaders: Array<string>
  noCasesMessage: string
}

export type subNavItem = {
  id: string
  title: string
  href: string
}

export type CaseListCase = {
  name: string
  crnOrPrisonNumber: string
  caseWorkers: Array<string>
  dateReceived: string
}
