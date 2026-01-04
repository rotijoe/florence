export function stopLinkNavigation(e: { preventDefault: () => void; stopPropagation: () => void }) {
  e.preventDefault()
  e.stopPropagation()
}

