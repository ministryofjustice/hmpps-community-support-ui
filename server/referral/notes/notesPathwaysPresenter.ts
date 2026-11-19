import type { ReferralNoteOrNonContactSessionBffDto } from '@community-support-api'
import type { PagedResponse } from '../../@types/communitySupportApi/derived'
import ReferralLayoutPresenter, { ReferralNavigationValues } from '../referralLayout/referralLayoutPresenter'
import { NotesPathwaysModel } from './NotesPathwaysModel'

export default class NotesPathwaysPresenter extends ReferralLayoutPresenter<NotesPathwaysModel> {
  constructor(
    private readonly notesResponse: PagedResponse<ReferralNoteOrNonContactSessionBffDto>,
    private readonly caseReference: string,
  ) {
    super(ReferralNavigationValues.notesTab, caseReference)
  }

  protected getTemplatePath(): string {
    return 'referral/notes'
  }

  buildViewModel(): NotesPathwaysModel {
    // const content = this.buildStaticContent()['/referral/:id/notes/pathways']
    return { temp: 'hello' }
  }
}
