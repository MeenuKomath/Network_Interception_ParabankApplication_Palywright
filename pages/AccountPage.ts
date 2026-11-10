import { Page, Locator } from '@playwright/test';

export class AccountPage {
    readonly page: Page;
    readonly accountTable: Locator;
    readonly accountRows: Locator;
    readonly totalRow: Locator;

    constructor(page: Page) {
        this.page = page;
        this.accountTable = page.locator('#accountTable');
        this.accountRows = this.accountTable.locator('tbody tr:has(a)');
        this.totalRow = this.accountTable.locator('tbody tr:has-text("Total")');
    }

    getAccountRowCells(rowIndex: number) {
        const row = this.accountRows.nth(rowIndex);
        return {
            accountNumberCell: row.locator('td').nth(0),
            balanceCell: row.locator('td').nth(1),
            availableBalanceCell: row.locator('td').nth(2)
        };
    }

    getTotalRowCells() {
        return {
            labelCell: this.totalRow.locator('td').nth(0),
            totalBalanceCell: this.totalRow.locator('td').nth(1)
        };
    }
}
