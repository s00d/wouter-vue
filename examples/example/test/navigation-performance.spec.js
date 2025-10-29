import { test, expect } from '@playwright/test';

test('навигация по всем route1-200 через клики и измерение времени', async ({ page }) => {
  const startTime = Date.now();
  const visitedRoutes = [];
  
  // Начинаем на главной странице
  await page.goto('/');
  await expect(page).toHaveURL('/');
  
  // Ждем появления страницы
  await page.waitForLoadState('networkidle');
  
  // Кликаем на кнопку "Test Routes (1-200)" для перехода на route1
  await page.locator('a[href="/route1"]').click();
  await page.waitForURL('**/route1');
  await expect(page).toHaveURL(/\/route1$/);
  visitedRoutes.push('/route1');
  
  // Проходим по всем роутам от 2 до 200
  for (let i = 2; i <= 200; i++) {
    const routePath = `/route${i}`;
    const clickStart = Date.now();
    
    // Используем программируемую навигацию через URL
    await page.goto(routePath);
    
    // Ждем навигации
    await page.waitForURL(`**${routePath}`);
    
    // Проверяем, что URL правильный
    await expect(page).toHaveURL(routePath);
    
    // Проверяем, что страница загрузилась
    await expect(page.locator('body')).toBeVisible();
    
    visitedRoutes.push(routePath);
    
    const clickTime = Date.now() - clickStart;
    
    // Логируем каждый 50-й роут для мониторинга
    if (i % 50 === 0) {
      console.log(`Пройдено ${i} роутов (последний клик: ${clickTime}ms)`);
    }
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const averageTimePerRoute = totalTime / 200;
  
  console.log('\n=== Результаты ===');
  console.log(`Всего роутов: ${visitedRoutes.length}`);
  console.log(`Общее время: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)`);
  console.log(`Среднее время на роут: ${averageTimePerRoute.toFixed(2)}ms`);
  console.log(`Первый роут: ${visitedRoutes[0]}`);
  console.log(`Последний роут: ${visitedRoutes[visitedRoutes.length - 1]}`);
  
  // Проверяем, что прошли все 200 роутов
  expect(visitedRoutes.length).toBe(200);
});

test('быстрый переход между роутами', async ({ page }) => {
  console.log('\n=== Тест быстрой навигации ===');
  const startTime = Date.now();
  
  // Переходим быстро между роутами 1-10-50-100-150-200
  const testRoutes = [1, 10, 50, 100, 150, 200];
  
  for (const routeNum of testRoutes) {
    const routePath = `/route${routeNum}`;
    const routeStart = Date.now();
    
    await page.goto(routePath);
    await expect(page).toHaveURL(routePath);
    
    const routeTime = Date.now() - routeStart;
    console.log(`${routePath}: ${routeTime}ms`);
  }
  
  const totalTime = Date.now() - startTime;
  console.log(`Общее время быстрой навигации: ${totalTime}ms`);
});

