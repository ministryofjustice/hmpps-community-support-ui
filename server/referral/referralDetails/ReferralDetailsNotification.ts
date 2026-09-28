export type ReferralDetailsNotification =
  | {
      type: 'success'
      code: 'withdrawalCompleted'
      caseReference: string
    }
  | {
      type: 'warning'
      code: 'withdrawalAlreadyCompleted'
      caseReference: string
    }
