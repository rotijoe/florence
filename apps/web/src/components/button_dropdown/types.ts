export interface ButtonDropdownItem {
  label: string
  onSelect: () => void
}

export interface ButtonDropdownProps {
  text: string
  dropdownItems: ButtonDropdownItem[]
}
