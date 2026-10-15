import { GovukFrontendBackLink, GovukFrontendButton } from '@govuk-frontend'
import { GovukFrontendRadiosWithConditional } from '../../@types/govukFrontend/derived'
import { GlobalContent } from '../../../assets/content/GlobalContent'

export interface NeedsAnInterpreterViewModel {
  pageTitle: string
  backLink: GovukFrontendBackLink
  radios: GovukFrontendRadiosWithConditional
  button: GovukFrontendButton
}

export type NeedsAnInterpreterContent = GlobalContent['/referral/task-list/needs-an-interpreter']
