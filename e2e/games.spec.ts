import { test, expect } from '@playwright/test'

test.describe('Games page', () => {
  test('shows games list heading', async ({ page }) => {
    await page.goto('/games')
    await expect(page.getByRole('heading', { name: /todos los juegos/i })).toBeVisible()
  })

  test('can navigate to add game from nav or content', async ({ page }) => {
    await page.goto('/games')
    const addLink = page.getByRole('link', { name: /añadir|add/i }).first()
    await addLink.click()
    await expect(page).toHaveURL(/\/add-game/)
  })
})
