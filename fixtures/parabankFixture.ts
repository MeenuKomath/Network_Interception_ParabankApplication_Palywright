import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AccountPage } from '../pages/AccountPage';
import mockData from '../testdata/accountMocks.json';

type ParaBankFixtures = {
    loginPage: LoginPage;
    accountPage: AccountPage;
    interceptLoginRequest: void;
    mockAccountOverview: void;
    abortLoginRequest: void;
};

export const test = base.extend<ParaBankFixtures>({

    // 1. Initialize Login Page Object Model
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    // 2. Initialize Account Page Object Model
    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page));
    },

    // 3. Spy / Log Interception: Watches live login traffic
    interceptLoginRequest: async ({ page }, use) => {
        await page.route('**/parabank/login.htm*', async (route) => {
            console.log('--- Intercepted Request Details ---');
            console.log('Intercepted request to:', route.request().url());
            console.log('Request method:', route.request().method());
            console.log('Request headers:', route.request().headers());
            console.log('Request postdata:', route.request().postData());
            console.log('-----------------------------------');

            await route.continue();
        });
        await use();
    },

    // 4. Mock Data Interception: Replaces account proxy response using external JSON
    mockAccountOverview: async ({ page }, use) => {
        await page.route('**/services_proxy/bank/customers/*/accounts', async (route) => {
            console.log(`[SUCCESS] Intercepted request to: ${route.request().url()}`);

            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(mockData),
            });
        });
        await use();
    },

    // 5. Abort Interception: Simulates severe server downtime safely
    abortLoginRequest: async ({ page }, use) => {
        await page.route('**/parabank/login.htm*', async (route) => {
            console.log(`[SERVER INTERCEPT] Simulating backend failure for request to: ${route.request().url()}`);

            
            await route.fulfill({
                status: 500,
                contentType: 'text/html',
                body: '<h1>Internal Server Error - Simulating Connection Failure</h1>'
            });
        });
        await use();
    },
});

export { expect } from '@playwright/test';
