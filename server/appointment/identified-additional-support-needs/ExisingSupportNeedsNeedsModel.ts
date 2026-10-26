import { ExistingSupportNeedsBffResponseDto } from '@community-support-api'

export interface ExisintingSupportNeedsContent {
  needName: string
  needDetails: string
}

export type ExistingSupportNeedsPresenterData = Pick<
  ExistingSupportNeedsBffResponseDto,
  'supportNeeds' | 'referralFirstName'
>
