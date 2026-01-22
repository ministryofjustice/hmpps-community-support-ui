import { Factory } from 'fishery'
import { CaseListContent } from '../../caseList/caseListViewModel'

class CaselistContentFactory extends Factory<CaseListContent> { }

export default CaselistContentFactory.define(({ transientParams }) => ({
  inProgressSubNavTitle: transientParams.inProgressSubNavTitle || 'In progress cases',
  unassignedSubNavTitle: transientParams.unassignedSubNavTitle || 'Unassigned cases',
  pageHeader: transientParams.pageHeader || 'Cases',
  subNavItems: transientParams.subNavItems || [
    { id: 'unassigned', title: 'Unassigned cases', href: '/unassigned-cases?selected=unassigned' },
    { id: 'inProgress', title: 'Cases in progress', href: '/in-progress-cases' },
  ],
  unassignedColumnHeaders: transientParams.unassignedColumnHeaders || ['Name', 'CRN/Prison number', 'Date received'],
  inProgressColumnHeaders: transientParams.inProgressColumnHeaders || [
    'Name',
    'CRN/Prison number',
    'Case workers',
    'Date received',
  ],
  noCasesMessage:
    transientParams.noCasesMessage ||
    `There are currently no {0} cases. Please check back later or contact your administrator if you think this is an error.`,
}))
