class AppointmentValidator {
  getReasonKey(sessionTakePlace: string): string | null {
    switch (sessionTakePlace) {
      case 'ByPhone':
        return 'ByPhone'
      case 'ByVideo':
        return 'ByVideo'
      case 'InSomewhereElse':
        return 'InSomewhereElse'
      default:
        return null
    }
  }
}

export default AppointmentValidator
