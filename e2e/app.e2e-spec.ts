import { JsChoirMixerAngular2Page } from './app.po';

describe('js-choir-mixer-angular2 App', function() {
  let page: JsChoirMixerAngular2Page;

  beforeEach(() => {
    page = new JsChoirMixerAngular2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
