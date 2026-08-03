import { expect, test, type Page } from '@playwright/test'

const masterKey =
  process.env.AYC_E2E_MASTER_KEY?.trim() || process.env.AYC_MASTER_KEY?.trim() || ''

async function unlockWithMasterKey(page: Page) {
  test.skip(!masterKey, 'Set AYC_E2E_MASTER_KEY or AYC_MASTER_KEY to run unlock smokes')

  await page.goto('/leader')
  await expect(page.getByRole('heading', { name: /unlock the workbench/i })).toBeVisible()
  await page.locator('#leader-code').fill(masterKey)
  await page.getByRole('button', { name: /unlock board/i }).click()
  await expect(page.getByRole('heading', { name: 'Leader Board' })).toBeVisible({
    timeout: 30_000,
  })
}

test.describe('public paths', () => {
  test('home shows brand and join CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Arkansas Youth Coalition').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /^join$/i }).first()).toBeVisible()
    await expect(page.locator('body')).not.toContainText('Password required')
  })

  test('join form loads', async ({ page }) => {
    await page.goto('/join')
    await expect(
      page.getByRole('heading', { name: /join the arkansas youth coalition/i }),
    ).toBeVisible()
    await expect(page.locator('#join-first')).toBeVisible()
    await expect(page.locator('#join-last')).toBeVisible()
  })

  test('directory loads', async ({ page }) => {
    await page.goto('/directory')
    await expect(
      page.getByRole('heading', { name: /leadership directory/i }),
    ).toBeVisible()
  })

  test('calendar loads', async ({ page }) => {
    await page.goto('/calendar')
    await expect(page.getByRole('heading', { name: /public calendar/i })).toBeVisible()
  })

  test('feedback loads', async ({ page }) => {
    await page.goto('/feedback')
    await expect(
      page.getByRole('heading', { name: /help build the workbench/i }),
    ).toBeVisible()
  })

  test('forgot password loads', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.getByRole('heading', { name: /forgot password/i })).toBeVisible()
    const email = page.locator('#forgot-email')
    const unconfigured = page.getByText(/not configured on this environment/i)
    await expect(email.or(unconfigured)).toBeVisible()
  })

  test('login offers Google when configured', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /^log in$/i })).toBeVisible()
    const google = page.getByRole('button', { name: /continue with google/i })
    const unconfigured = page.getByText(/not configured on this environment/i)
    await expect(google.or(unconfigured)).toBeVisible()
  })
})

test.describe('master unlock + board', () => {
  test('break-glass unlock opens Leader Board', async ({ page }) => {
    await unlockWithMasterKey(page)
    await expect(page.getByText(/statewide category boards/i)).toBeVisible()
  })

  test('unlocked session opens one category board', async ({ page }) => {
    await unlockWithMasterKey(page)
    await page.goto('/leader/teams/organizer')
    await expect(
      page.getByRole('heading', { name: /organizer lead board/i }),
    ).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText(/unlock the workbench/i)).toHaveCount(0)
  })
})
