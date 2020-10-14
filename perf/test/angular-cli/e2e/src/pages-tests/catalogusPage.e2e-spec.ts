import {CatalogusPage} from '../page-objects/catalogusPage';
import {browser, logging} from 'protractor';

describe('Catalogus Page', () => {
  let catalogusPage: CatalogusPage;
  beforeEach(() => {
    catalogusPage = new CatalogusPage();
    catalogusPage.navigateTo();
  });

  it('url should be : /catalogus', () => {
    const url = browser.getCurrentUrl();
    expect(url).toContain('/catalogus');
  });

  it('header should have banner', () => {
    const banner = catalogusPage.getBanner();
    expect(banner.isPresent()).toBeTruthy();
  });

  it('menu should contain winkelwagen', () => {
    const winkelwagen = catalogusPage.getWinkelwagen();
    expect(winkelwagen.isPresent()).toBeTruthy();
  });

  it('menu should contain all menu-items', () => {
    const menuItems = catalogusPage.getMenuItems();
    expect(menuItems.getText()).toContain('Catalogus');
  });

  it('footer address element should be present', () => {
    const footer = catalogusPage.getFooter();
    expect(footer.isPresent()).toBeTruthy();
  });

  describe('Test catalogus', () => {
    it('catalogus should be empty', () => {
      const emptyMessage = catalogusPage.getEmptyCatalogusMessage();
      expect(emptyMessage).toBe('Geen artikelen gevonden.');
    });
  });
  
  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
