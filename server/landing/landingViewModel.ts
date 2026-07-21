export type LandingTileContent = {
  heading: string
  description: string
  href: string
  dataTestId?: string
}

export type LandingContent = {
  pageHeader: string
  tiles: Array<LandingTileContent>
}

export type LandingViewModel = {
  pageHeader: string
  tiles: Array<LandingTileContent>
}
