import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test.describe('ChartAI E2E', () => {
  test('Login page loads', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('text=CHARTAI')).toBeVisible()
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('Guest login navigates to dashboard', async ({ page }) => {
    await page.goto(BASE)
    await page.click('text=Continue as Guest')
    await expect(page).toHaveURL(BASE + '/')
    await expect(page.locator('text=CHARTAI')).toBeVisible()
  })

  test('Register and login flow', async ({ page }) => {
    const email = `test_${Date.now()}@test.com`
    await page.goto(`${BASE}/login`)

    // Switch to register
    await page.click('text=register')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', 'password123')
    await page.click('text=Create Account')

    // Should redirect to dashboard
    await expect(page).toHaveURL(BASE + '/')
  })

  test('Dashboard shows chart and sidebar', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.click('text=Continue as Guest')

    await expect(page.locator('text=Watchlist')).toBeVisible()
    await expect(page.locator('text=Indicators')).toBeVisible()
    await expect(page.locator('text=AI ANALYSIS')).toBeVisible()
    await expect(page.locator('text=RSI')).toBeVisible()
  })

  test('Can switch tickers from watchlist', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.click('text=Continue as Guest')

    await page.click('text=TSLA')
    // URL or internal state updates — check ticker input changes
    await expect(page.locator('input[style*="text-transform: uppercase"]').first()).toHaveValue('TSLA')
  })

  test('Can switch timeframes', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.click('text=Continue as Guest')

    await page.click('button:has-text("1d")')
    // Just ensure no crash
    await expect(page.locator('text=CHARTAI')).toBeVisible()
  })

  test('AI panel has quick action buttons', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.click('text=Continue as Guest')

    await expect(page.locator('text=Analyze trend')).toBeVisible()
    await expect(page.locator('text=Key levels')).toBeVisible()
    await expect(page.locator('text=RSI signal')).toBeVisible()
  })

  test('Logout redirects to login', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.click('text=Continue as Guest')

    await page.click('text=LOGOUT')
    await expect(page).toHaveURL(`${BASE}/login`)
  })
})
