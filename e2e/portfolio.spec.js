import {test,expect} from '@playwright/test';
test('pages load without script errors or horizontal overflow',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const path of ['/','/episodes.html','/certifications.html','/skills.html','/support.html']) {
    await page.goto(path);await expect(page.locator('header nav')).toBeAttached();
    await expect(page.locator('main')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  expect(errors).toEqual([]);
});
test('project stories load from PostgreSQL and CampusLink opens the correct app',async({page})=>{
  const response=await page.request.get('/api/projects');expect(response.ok()).toBe(true);
  const {projects}=await response.json();
  await page.goto('/episodes.html');await expect(page.locator('.project-story')).toHaveCount(projects.length);
  await page.locator('[data-project-search]').fill('CampusLink');
  await expect(page.locator('.project-story')).toHaveCount(1);
  await expect(page.locator('#campuslink a').first()).toHaveAttribute('href','https://campuslink-rz6d.onrender.com/');
});
test('certificate search and keyboard dismissal work',async({page})=>{
  await page.goto('/certifications.html');await page.locator('[data-cert-search]').fill('Jarvis');
  await expect(page.locator('.cert-card')).toHaveCount(1);await page.locator('[data-open-modal]').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('[data-modal-actions] a').filter({hasText:'Jarvis AI'})).toHaveAttribute('href','https://github.com/DeekshaKriti07/Jarvis-AI.git');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toBeHidden();
});
test('mobile navigation opens and closes',async({page,isMobile})=>{
  test.skip(!isMobile,'Mobile menu only');await page.goto('/');
  await page.getByRole('button',{name:'Open menu'}).click();await expect(page.locator('#menu')).toBeVisible();
  await page.getByRole('button',{name:'Close menu'}).click();await expect(page.locator('#menu')).toBeHidden();
});
