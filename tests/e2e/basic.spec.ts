import { test, expect } from '@playwright/test';

test.describe('Todo PWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    await expect(page).toHaveTitle(/Todo PWA/);
    await expect(page.locator('h1')).toContainText('กล่องจดหมาย'); // Thai for \"Inbox\"
  });

  test('should be able to add a new todo', async ({ page }) => {
    // Add a new todo using quick add
    const quickAdd = page.locator('input[placeholder*=\"เพิ่ม Todo ใหม่\"]');
    await quickAdd.fill('Test todo from E2E');
    await quickAdd.press('Enter');
    
    // Wait for the todo to appear
    await expect(page.locator('text=Test todo from E2E')).toBeVisible();
  });

  test('should be able to complete a todo', async ({ page }) => {
    // First add a todo
    const quickAdd = page.locator('input[placeholder*=\"เพิ่ม Todo ใหม่\"]');
    await quickAdd.fill('Todo to complete');
    await quickAdd.press('Enter');
    
    // Wait for todo to appear
    await expect(page.locator('text=Todo to complete')).toBeVisible();
    
    // Click the completion button
    const todoItem = page.locator('text=Todo to complete').locator('..');
    const completeButton = todoItem.locator('button').first();
    await completeButton.click();
    
    // Todo should be marked as completed (have line-through)
    await expect(todoItem.locator('text=Todo to complete')).toHaveClass(/line-through/);
  });

  test('should navigate to different pages', async ({ page }) => {
    // Test navigation to Today page
    await page.click('text=วันนี้'); // Thai for \"Today\"
    await expect(page).toHaveURL('/today');
    await expect(page.locator('h1')).toContainText('วันนี้');
    
    // Test navigation to Completed page
    await page.click('text=เสร็จแล้ว'); // Thai for \"Completed\"
    await expect(page).toHaveURL('/completed');
    await expect(page.locator('h1')).toContainText('เสร็จแล้ว');
  });

  test('should work offline', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Navigate to offline page should work
    await page.goto('/offline');
    await expect(page.locator('text=คุณกำลังออฟไลน์')).toBeVisible(); // Thai for \"You're offline\"
    
    // Navigate back to home should still work (cached)
    await page.click('text=กลับไปที่แอป'); // Thai for \"Back to app\"
    await expect(page).toHaveURL('/');
  });

  test('should toggle language', async ({ page }) => {
    // Open sidebar on mobile
    const menuButton = page.locator('button[aria-label=\"Open sidebar\"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Click language toggle
    await page.click('text=TH');
    
    // Check if language changed to English
    await expect(page.locator('h1')).toContainText('Inbox');
    
    // Toggle back to Thai
    await page.click('text=EN');
    await expect(page.locator('h1')).toContainText('กล่องจดหมาย');
  });

  test('should toggle theme', async ({ page }) => {
    // Open sidebar on mobile
    const menuButton = page.locator('button[aria-label=\"Open sidebar\"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Get initial theme
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    
    // Click theme toggle
    const themeButton = page.locator('button[aria-label=\"Toggle theme\"]');
    await themeButton.click();
    
    // Check if theme changed
    const newClass = await html.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });
});"