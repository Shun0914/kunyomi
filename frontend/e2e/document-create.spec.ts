import { test, expect } from '@playwright/test';

/**
 * ドキュメント作成フローのE2Eテスト
 *
 * シナリオ：ホーム画面 → 新規作成画面 → ドキュメント内容入力 → ドキュメント登録 → ドキュメント詳細
 *
 * 前提条件：
 * - フロントエンド: http://localhost:3000
 * - バックエンド: http://localhost:8000
 * - init_genres.py, init_users.py が実行済み
 */
test.describe('ドキュメント作成フロー', () => {
  test('ホーム→新規作成→入力→登録→詳細表示', async ({ page }) => {
    // 1. ドキュメント一覧（ホーム）にアクセス
    await page.goto('/document-list');
    await expect(page).toHaveURL(/document-list/);

    // 2. 新規作成ボタンをクリック
    await page.getByRole('button', { name: '新規作成' }).click();

    // 3. 作成フォームが表示されるのを待つ
    await expect(page.getByRole('heading', { name: '新規ナレッジを作成' })).toBeVisible({
      timeout: 10000,
    });

    // 4. フォームに入力
    const testTitle = `E2Eテスト用ドキュメント ${Date.now()}`;
    const testContent = 'これはPlaywrightによるE2Eテストで作成されたドキュメントです。';

    await page.getByPlaceholder('ナレッジのタイトルを入力').fill(testTitle);
    await page.getByRole('combobox').first().click();
    await page.getByRole('option').first().click();
    await page.getByPlaceholder(/ナレッジの内容を入力/).fill(testContent);

    // 5. 登録ボタンをクリック
    await page.getByRole('button', { name: '登録' }).click();

    // 6. 成功ダイアログが表示される
    await expect(page.getByRole('dialog').getByText('登録が完了しました')).toBeVisible({
      timeout: 10000,
    });

    // 7. OKをクリックして詳細画面へ遷移
    await page.getByRole('button', { name: 'OK' }).click();

    // 8. ドキュメント詳細画面に遷移したことを確認
    await expect(page).toHaveURL(/\/documents\/\d+/);
    await expect(page.getByRole('heading', { name: testTitle })).toBeVisible({
      timeout: 5000,
    });
  });
});
