import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('loads and shows main heading', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /tu lista de juegos/i })).toBeVisible()
  })

  test('has link to games list', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /ver todos/i }).first().click()
    await expect(page).toHaveURL(/\/games/)
    await expect(page.getByRole('heading', { name: /todos los juegos/i })).toBeVisible()
  })
})
