import { setWorldConstructor, setDefaultTimeout, World } from '@cucumber/cucumber'
import { Browser, BrowserContext, chromium, Page } from 'playwright'

export default class TestWorld extends World {
  browser!: Browser

  page!: Page

  async init() {
    this.browser = await chromium.launch({
      // headless: true,
      //  slowMo: 1000
    })
    this.page = await this.browser.newPage()
  }

  async destroy() {
    await this.page.close()
    await this.browser.close()
  }
}

setWorldConstructor(TestWorld)
