import { Before, Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import { AppPage } from '../app.po';

let page: AppPage;

Before(() => {
    page = new AppPage();
});

Given(/^Login page$/, { timeout: 4 * 800 }, async () => {
  await page.navigateToLogin();
});
When(/^I do nothing$/, () => {});
Then(/^Chat title$/, async () => {
  expect(await page.getTitleText()).to.equal('Login Chat EN3A');
});
