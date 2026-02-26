export type MojSubNavigation = {
  label: string
  items: Array<MojSubNavigationItem>
}

export type MojSubNavigationItem = {
  text: string
  href: string
  active?: boolean
}
