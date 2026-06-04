class AppointmentValidator {
  getReasonKey(sessionTakePlace: string): string | null {
    switch (sessionTakePlace) {
      case 'byPhone':
        return 'byPhone'
      case 'byVideo':
        return 'byVideo'
      case 'inSomewhereElse':
        return 'inSomewhereElse'
      default:
        return null
    }
  }
}

export default AppointmentValidator
