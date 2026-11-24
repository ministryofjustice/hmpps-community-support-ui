import { GlobalContent } from '../../assets/content/GlobalContent'
import PresenterBase from './presenterBase'

class TestPresenter extends PresenterBase<unknown> {
  protected globalContent(): GlobalContent {
    return {
      example: { page: { title: 'Example page' }, empty: null, text: 'Example' },
    } as unknown as GlobalContent
  }

  buildViewModel(): unknown {
    return this.getPageContent('example.page')
  }

  protected getTemplatePath(): string {
    return 'example'
  }

  resolveContent(pageRoute: string): unknown {
    return this.getPageContent(pageRoute)
  }
}

describe('PresenterBase content lookup', () => {
  const presenter = new TestPresenter()

  it('resolves a nested page from global content', () => {
    expect(presenter.resolveContent('example.page')).toEqual({ title: 'Example page' })
  })

  it('resolves a top-level content section', () => {
    expect(presenter.resolveContent('example')).toEqual({
      page: { title: 'Example page' },
      empty: null,
      text: 'Example',
    })
  })

  it.each(['', 'missing.page', 'example.missing', 'example.empty.page', 'example.text.page', 'example.toString'])(
    'returns undefined for an unresolvable route: %s',
    pageRoute => {
      expect(presenter.resolveContent(pageRoute)).toBeUndefined()
    },
  )
})
