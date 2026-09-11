import { WithdrawalFormData } from '../referral/withdrawal/WithdrawalFormData'

export default class WithdrawalService {
  getWithdrawal(referralIdentifier: string, withdrawals: Record<string, WithdrawalFormData> | undefined) {
    return withdrawals?.[referralIdentifier]
  }

  saveWithdrawal(
    referralIdentifier: string,
    withdrawal: WithdrawalFormData,
    withdrawals: Record<string, WithdrawalFormData> | undefined,
  ): Record<string, WithdrawalFormData> {
    return { ...withdrawals, [referralIdentifier]: withdrawal }
  }

  removeWithdrawal(
    referralIdentifier: string,
    withdrawals: Record<string, WithdrawalFormData> | undefined,
  ): Record<string, WithdrawalFormData> {
    if (!withdrawals) {
      return {}
    }

    const { [referralIdentifier]: _removed, ...remainingWithdrawals } = withdrawals
    return remainingWithdrawals
  }
}
