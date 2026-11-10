import { test, expect } from '../fixtures/parabankFixture';

test.describe("Network Interception - ParaBank Application", () => {

    const username = process.env.TEST_USERNAME || '';
    const password = process.env.TEST_PASSWORD || '';

    test('TC : 01 - Intercept and Verification of ParaBank Login', async ({ loginPage, accountPage, interceptLoginRequest, page }) => {
        await loginPage.navigate();
        await loginPage.login(username, password);
        await expect(accountPage.accountTable).toBeVisible();
        console.log('Login successful and account table is visible.', page.url());
    });

    test('TC : 02 - Intercept and Mock Accounts Overview Table', async ({ loginPage, accountPage, mockAccountOverview, page }) => {
        await loginPage.navigate();
        await loginPage.login(username, password);
        await expect(accountPage.accountTable).toBeVisible();
        console.log('Login successful and account table is visible.', page.url());

        // Verify row counts (4 mock accounts inside tbody)
        await expect(accountPage.accountRows).toHaveCount(4);

        // ─── Content & Dynamic Value Assertions ───

        // Row 1: Negative balance validations
        const firstAccount = accountPage.getAccountRowCells(0);
        await expect(firstAccount.accountNumberCell).toHaveText('12345');
        await expect(firstAccount.balanceCell).toHaveText('-$3310.00');
        await expect(firstAccount.availableBalanceCell).toHaveText('$0.00');

        // Row 2: Positive balance validations
        const secondAccount = accountPage.getAccountRowCells(1);
        await expect(secondAccount.accountNumberCell).toHaveText('12456');
        await expect(secondAccount.balanceCell).toHaveText('$420.45');
        await expect(secondAccount.availableBalanceCell).toHaveText('$420.45');

        // Total Row Calculation Assertion
        const totalSummary = accountPage.getTotalRowCells();
        await expect(totalSummary.labelCell).toHaveText('Total');
        await expect(totalSummary.totalBalanceCell).toHaveText('-$2889.55');

        console.log('All mock data assertions passed successfully!');
    });

    test('TC : 03 - Abort Interception (Network Failure)', async ({ loginPage, abortLoginRequest, page }) => {
        await loginPage.navigate();

        const failedResponsePromise = page.waitForEvent('requestfinished', {
            predicate: (request) => request.url().includes('login.htm'),
            timeout: 5000
        });

        // Execute login with expectFailure configuration set to true 
        await loginPage.login(username, password, true);

        // Confirm the network request returned the mocked server error status
        const finishedRequest = await failedResponsePromise;
        const response = await finishedRequest.response();
        expect(response?.status()).toBe(500);

        console.error(`[NETWORK BLOCKED] The request to "${finishedRequest.url()}" safely failed with status code: ${response?.status()}`);
        console.log(`[UI STATE] Current active browser URL remains on landing page: ${page.url()}`);

        // Verifies the user remains safely on the landing page layout instead of crashing
        expect(page.url()).toContain('login.htm');
    });
});
