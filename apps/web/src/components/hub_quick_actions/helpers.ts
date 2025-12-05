import type { HubQuickActionKind, HubQuickActionOption, HubQuickActionsProps } from './types'
import type { ButtonDropdownItem } from '@/components/button_dropdown/types'

export function handleSelectFallback(args: { kind: HubQuickActionKind; value: string }) {
  // Placeholder for future navigation / modal flows
  void args
}

export function convertOptionsToDropdownItems(
  kind: HubQuickActionKind,
  options?: HubQuickActionOption[],
  onSelect?: HubQuickActionsProps['onSelectOption']
): ButtonDropdownItem[] {
  if (!options || options.length === 0) {
    return []
  }

  const handleSelect = onSelect ?? handleSelectFallback

  return options.map((option) => ({
    label: option.label,
    onSelect: () => handleSelect({ kind, value: option.value })
  }))
}
