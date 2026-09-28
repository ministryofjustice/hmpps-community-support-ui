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

  it('removes one withdrawal and keeps others', () => {
    const withdrawals = service.saveWithdrawal(
      'first-referral',
      { withdrawalReason: 'NOT_ENGAGED', additionalInformation: 'No longer engaging' },
      service.saveWithdrawal(
        'second-referral',
        { withdrawalReason: 'USER_DIED', additionalInformation: 'Reported by partner' },
        undefined,
      ),
    )

    const remaining = service.removeWithdrawal('first-referral', withdrawals)

    expect(remaining['first-referral']).toBeUndefined()
    expect(remaining['second-referral']).toEqual({
      withdrawalReason: 'USER_DIED',
      additionalInformation: 'Reported by partner',
    })
  })
})
