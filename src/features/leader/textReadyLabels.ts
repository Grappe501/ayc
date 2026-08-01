export function preferredLabel(method: string | null | undefined): string {
  switch (method) {
    case 'TEXT':
      return 'Text'
    case 'EMAIL':
      return 'Email'
    case 'EITHER':
      return 'Either'
    default:
      return 'Unknown'
  }
}
