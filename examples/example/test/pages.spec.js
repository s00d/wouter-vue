import { test, expect } from '@playwright/test';

test.describe('Pages Content Tests', () => {
  test('Home Page - проверка контента', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="home-page"]');
    
    // Проверка заголовка
    await expect(page.locator('h1')).toHaveText('Home Page');
    
    // Проверка приветственного текста
    await expect(page.locator('[data-testid="home-page"] p').first()).toContainText('Welcome to wouter-vue demo!');
    
    // Проверка секции Features
    await expect(page.locator('[data-testid="home-page"] .features h2')).toHaveText('Features');
    await expect(page.locator('[data-testid="home-page"] .features li').first()).toContainText('Tiny router');
    
    // Проверка ссылок
    await expect(page.locator('[data-testid="home-page"] a[href="/about"]')).toBeVisible();
    await expect(page.locator('[data-testid="home-page"] a[href="/users"]')).toBeVisible();
    await expect(page.locator('[data-testid="home-page"] a[href="/heavy"]')).toBeVisible();
    await expect(page.locator('[data-testid="home-page"] a[href="/route1"]')).toBeVisible();
  });

  test('About Page - проверка контента', async ({ page }) => {
    await page.goto('/about');
    await page.waitForSelector('[data-testid="about-page"]');
    
    // Проверка заголовка
    await expect(page.locator('[data-testid="about-page"] h1')).toHaveText('About');
    
    // Проверка введения
    await expect(page.locator('[data-testid="about-page"] .intro')).toContainText('wouter-vue');
    
    // Проверка секции Features
    await expect(page.locator('[data-testid="about-page"] .features-box h2')).toHaveText('Features');
    await expect(page.locator('[data-testid="about-page"] .features-box li').first()).toContainText('Route matching');
    
    // Проверка URL информации
    await expect(page.locator('[data-testid="about-page"] .url-info-box h2')).toHaveText('URL Information');
    
    // Проверка обратной ссылки
    await expect(page.locator('[data-testid="about-page"] .nav-box a')).toContainText('Back to Home');
  });

  test('About Page - проверка query параметров и hash', async ({ page }) => {
    await page.goto('/about?page=2&sort=asc#section-1');
    await page.waitForSelector('[data-testid="about-page"]');
    
    // Проверка что query параметры отображаются
    await expect(page.locator('[data-testid="about-page"]')).toContainText('"page": "2"');
    await expect(page.locator('[data-testid="about-page"]')).toContainText('"sort": "asc"');
    
    // Проверка hash
    await expect(page.locator('[data-testid="about-page"]')).toContainText('#section-1');
  });

  test('Heavy Page - проверка контента', async ({ page }) => {
    await page.goto('/heavy');
    await page.waitForSelector('[data-testid="heavy-page"]', { timeout: 10000 });
    
    // Проверка заголовка
    await expect(page.locator('[data-testid="heavy-page"] h1')).toContainText('Heavy Page');
    
    // Проверка badge
    await expect(page.locator('[data-testid="heavy-page"] .badge')).toHaveText('ASYNCHRONOUS');
    
    // Проверка описания
    await expect(page.locator('[data-testid="heavy-page"] .intro')).toContainText('defineAsyncComponent');
    
    // Проверка секции с пунктами
    await expect(page.locator('[data-testid="heavy-page"] .demo-box li').first()).toContainText('Heavy computations');
    
    // Проверка интерактивного счетчика
    const counterBtn = page.locator('[data-testid="heavy-page"] .counter-btn');
    await expect(counterBtn).toBeVisible();
    await expect(counterBtn).toContainText('Counter:');
  });

  test('Users Page - проверка контента', async ({ page }) => {
    await page.goto('/users');
    await page.waitForSelector('[data-testid="users-page"]');
    
    // Проверка заголовка
    await expect(page.locator('[data-testid="users-page"] h1')).toHaveText('Users');
    
    // Проверка подзаголовка
    await expect(page.locator('[data-testid="users-page"] .subtitle')).toContainText('Select a user');
    
    // Проверка наличия пользователей
    await expect(page.locator('[data-testid="users-page"] .user-card')).toHaveCount(3);
    
    // Проверка первого пользователя
    await expect(page.locator('[data-testid="users-page"] .user-card').first()).toContainText('Alice Johnson');
    await expect(page.locator('[data-testid="users-page"] .user-card').first()).toContainText('Developer');
    
    // Проверка ссылок на детали пользователей
    await expect(page.locator('[data-testid="users-page"] a[href="/users/1"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-page"] a[href="/users/2"]')).toBeVisible();
    await expect(page.locator('[data-testid="users-page"] a[href="/users/3"]')).toBeVisible();
  });

  test('User Detail Page - проверка контента для пользователя 1', async ({ page }) => {
    await page.goto('/users/1');
    await page.waitForSelector('[data-testid="user-detail-page"]');
    
    // Проверка заголовка
    await expect(page.locator('[data-testid="user-detail-page"] h1')).toHaveText('User Details');
    
    // Проверка имени пользователя
    await expect(page.locator('[data-testid="user-detail-page"] .user-header h2')).toHaveText('Alice Johnson');
    
    // Проверка роли
    await expect(page.locator('[data-testid="user-detail-page"] .user-header .role')).toHaveText('Developer');
    
    // Проверка email
    await expect(page.locator('[data-testid="user-detail-page"] .info-item').filter({ hasText: 'Email' })).toContainText('alice@example.com');
    
    // Проверка location
    await expect(page.locator('[data-testid="user-detail-page"] .info-item').filter({ hasText: 'Location' })).toContainText('San Francisco');
    
    // Проверка bio
    await expect(page.locator('[data-testid="user-detail-page"] .info-item').filter({ hasText: 'Bio' })).toContainText('Passionate full-stack');
    
    // Проверка навигации
    await expect(page.locator('[data-testid="user-detail-page"] .btn-back')).toContainText('Back to Users');
    await expect(page.locator('[data-testid="user-detail-page"] .btn-home')).toContainText('Go Home');
  });

  test('User Detail Page - проверка контента для пользователя 2', async ({ page }) => {
    await page.goto('/users/2');
    await page.waitForSelector('[data-testid="user-detail-page"]');
    
    await expect(page.locator('[data-testid="user-detail-page"] .user-header h2')).toHaveText('Bob Smith');
    await expect(page.locator('[data-testid="user-detail-page"] .user-header .role')).toHaveText('Designer');
    await expect(page.locator('[data-testid="user-detail-page"] .info-item').filter({ hasText: 'Email' })).toContainText('bob@example.com');
  });

  test('User Detail Page - проверка несуществующего пользователя', async ({ page }) => {
    await page.goto('/users/999');
    await page.waitForSelector('[data-testid="user-detail-page"]');
    
    await expect(page.locator('[data-testid="user-detail-page"] .not-found')).toContainText('User not found');
  });

  test('Not Found Page - проверка контента', async ({ page }) => {
    await page.goto('/non-existent-page');
    await page.waitForSelector('[data-testid="not-found-page"]');
    
    // Проверка иконки 404
    await expect(page.locator('[data-testid="not-found-page"] .error-icon')).toHaveText('404');
    
    // Проверка заголовка
    await expect(page.locator('[data-testid="not-found-page"] h1')).toHaveText('Page Not Found');
    
    // Проверка текста
    await expect(page.locator('[data-testid="not-found-page"] p')).toContainText("doesn't exist");
    
    // Проверка кнопок
    await expect(page.locator('[data-testid="not-found-page"] .btn-primary')).toContainText('Go Home');
    await expect(page.locator('[data-testid="not-found-page"] .btn-secondary')).toContainText('Go Back');
  });

  test('Route Pages - проверка контента для Route1', async ({ page }) => {
    await page.goto('/route1');
    await page.waitForSelector('[data-testid="route-page"]');
    
    // Проверка заголовка
    await expect(page.locator('[data-testid="route-page"] h1')).toHaveText('Route 1');
    
    // Проверка описания
    await expect(page.locator('[data-testid="route-page"] p')).toContainText('performance comparison');
    
    // Проверка навигации
    await expect(page.locator('[data-testid="route-page"] .nav-link').filter({ hasText: 'Route 2' })).toBeVisible();
    await expect(page.locator('[data-testid="route-page"] .nav-link').filter({ hasText: 'Back to Home' })).toBeVisible();
  });

  test('Route Pages - проверка контента для Route100', async ({ page }) => {
    await page.goto('/route100');
    await page.waitForSelector('[data-testid="route-page"]');
    
    await expect(page.locator('[data-testid="route-page"] h1')).toHaveText('Route 100');
    await expect(page.locator('[data-testid="route-page"] p')).toContainText('performance comparison');
  });
});

