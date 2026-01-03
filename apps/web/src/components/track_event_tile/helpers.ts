export function getSeverityStyles(severity: number | null | undefined): {
  bgColor: string
  textColor: string
} {
  const severityValue = severity ?? 1

  switch (severityValue) {
    case 1:
      return {
        bgColor: 'bg-emerald-500',
        textColor: 'text-white'
      }
    case 2:
      return {
        bgColor: 'bg-yellow-500',
        textColor: 'text-white'
      }
    case 3:
      return {
        bgColor: 'bg-orange-500',
        textColor: 'text-white'
      }
    case 4:
      return {
        bgColor: 'bg-red-500',
        textColor: 'text-white'
      }
    case 5:
      return {
        bgColor: 'bg-rose-600',
        textColor: 'text-white'
      }
    default:
      return {
        bgColor: 'bg-emerald-500',
        textColor: 'text-white'
      }
  }
}

