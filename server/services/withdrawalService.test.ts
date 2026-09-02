import WithdrawalService from './withdrawalService'

describe('WithdrawalService', () => {
  const service = new WithdrawalService()

  it('stores withdrawals independently by referral identifier', () => {
    const first = service.saveWithdrawal(
      'first-referral',
      { withdrawalReason: 'NOT_ENGAGED', additionalInformation: 'No longer engaging' },
      undefined,
    )
    const withdrawals = service.saveWithdrawal(
      'second-referral',
      { withdrawalReason: 'USER_DIED', additionalInformation: 'Reported by partner' },
      first,
    )

    expect(service.getWithdrawal('first-referral', withdrawals)).toEqual({
      withdrawalReason: 'NOT_ENGAGED',
      additionalInformation: 'No longer engaging',
    })
    expect(service.getWithdrawal('second-referral', withdrawals)).toEqual({
      withdrawalReason: 'USER_DIED',
      additionalInformation: 'Reported by partner',
    })
  })
})
