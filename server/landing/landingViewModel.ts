import { GlobalContent } from '../../assets/content/GlobalContent'

export type LandingTileContent = LandingContent['tiles'][number]

export type LandingContent = GlobalContent['landing']

export type LandingViewModel = {
  pageHeader: string
  tiles: Array<LandingTileContent>
}
