// Synthetic UI fixtures only: no real login, credentials or database mutation.
const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const screenshots=path.resolve(__dirname,'../../docs/design/screenshots/auth-login');fs.mkdirSync(screenshots,{recursive:true});
 try{
  for(const [view,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
   const page=await browser.newPage({viewport:{width,height},hasTouch:view==='mobile'});let requests=0;
   await page.route('**/api/**',async route=>{
    if(route.request().url().endsWith('/auth/login')){requests++;await new Promise(resolve=>setTimeout(resolve,250));return route.fulfill({status:422,contentType:'application/json',body:JSON.stringify({success:false,message:'Synthetic sign-in error'})});}
    await route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({success:false,message:'Not signed in'})});
   });
   await page.goto('http://127.0.0.1:5173/login');const roles=page.getByRole('combobox',{name:'Select role',exact:true});await roles.waitFor();assert.equal(await roles.getAttribute('value'),'student');assert.equal(await roles.getAttribute('aria-expanded'),'false');
   for(const [value,label] of [['student','Student'],['tpo','TPO (Training & Placement Officer)'],['recruiter','Company']]){await roles.click();await page.getByRole('option',{name:label,exact:true}).click();assert.equal(await roles.getAttribute('value'),value);assert.equal(await roles.getAttribute('aria-expanded'),'false');assert.equal(await roles.evaluate(el=>el===document.activeElement),true);}
   await roles.focus();await page.keyboard.press('Home');await page.keyboard.press('Enter');assert.equal(await roles.getAttribute('value'),'student');
   await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');assert.equal(await roles.getAttribute('value'),'tpo');
   await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await page.keyboard.press('Escape');assert.equal(await roles.getAttribute('value'),'tpo');assert.equal(await roles.getAttribute('aria-expanded'),'false');assert.equal(await roles.evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('Space');await page.keyboard.press('ArrowDown');await page.keyboard.press('Space');assert.equal(await roles.getAttribute('value'),'recruiter');
   await roles.click();const geometryMenu=await page.evaluate(()=>{const field=document.querySelector('.auth-role-trigger').getBoundingClientRect(),menu=document.querySelector('.auth-role-menu').getBoundingClientRect();return {aligned:Math.abs(field.left-menu.left)<1&&Math.abs(field.width-menu.width)<1,background:getComputedStyle(document.querySelector('.auth-role-menu')).backgroundColor,options:document.querySelectorAll('[role="option"]').length};});assert.equal(geometryMenu.aligned,true);assert.equal(geometryMenu.background,'rgb(12, 12, 12)');assert.equal(geometryMenu.options,3);
   await page.getByRole('heading',{name:'Sign in to SkillSetu',exact:true}).click();assert.equal(await roles.getAttribute('aria-expanded'),'false');await page.getByLabel('Email',{exact:true}).click();assert.equal(await page.getByLabel('Email',{exact:true}).evaluate(el=>el===document.activeElement),true);
   if(view==='mobile'){await roles.tap();await page.getByRole('option',{name:'Student',exact:true}).tap();assert.equal(await roles.getAttribute('value'),'student');}
   await roles.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');assert.equal(await roles.getAttribute('aria-expanded'),'false');assert.equal(await page.getByLabel('Email',{exact:true}).evaluate(el=>document.activeElement===el),true);
   const focus=await page.getByLabel('Email',{exact:true}).evaluate(el=>({color:getComputedStyle(el).outlineColor,width:getComputedStyle(el).outlineWidth}));assert.equal(focus.color,'rgb(0, 255, 102)');assert.equal(focus.width,'2px');
   await page.getByRole('button',{name:'Sign in',exact:true}).click();assert.equal(requests,0);
   await page.getByLabel('Email',{exact:true}).fill('fixture@example.test');await page.getByLabel('Password',{exact:true}).fill('SyntheticFixtureOnly');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByRole('button',{name:'Signing in...',exact:true}).waitFor();await page.getByRole('alert').waitFor();assert.equal(await page.getByRole('alert').innerText(),'Synthetic sign-in error');assert.equal(await page.getByLabel('Email',{exact:true}).inputValue(),'fixture@example.test');assert.equal(requests,1);
   assert.equal(await page.getByRole('link',{name:'Forgot password?',exact:true}).getAttribute('href'),'/forgot-password');assert.equal(await page.getByRole('link',{name:'Create an account',exact:true}).getAttribute('href'),'/register');
   await page.mouse.move(0,0);await page.waitForTimeout(220);
   const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,background:getComputedStyle(document.querySelector('.skillsetu-auth')).backgroundColor,panel:getComputedStyle(document.querySelector('.auth-panel')).backgroundColor,button:getComputedStyle(document.querySelector('.auth-form button[type="submit"]')).backgroundColor,buttonText:getComputedStyle(document.querySelector('.auth-form button[type="submit"]')).color,columns:getComputedStyle(document.querySelector('.auth-layout')).gridTemplateColumns}));assert.equal(geometry.overflow,false);assert.equal(geometry.background,'rgb(5, 5, 5)');assert.equal(geometry.panel,'rgb(12, 12, 12)');assert.equal(geometry.button,'rgb(0, 255, 102)');assert.equal(geometry.buttonText,'rgb(0, 0, 0)');
   await page.getByRole('combobox',{name:'Select role',exact:true}).click();await page.screenshot({path:path.join(screenshots,`${view}.png`),fullPage:true});console.log(JSON.stringify({viewport:view,allRoleSelections:true,keyboardAndFocus:true,escapeAndOutsideDismissal:true,menuWidthAligned:true,nativeValidation:true,loadingAndError:true,linksPreserved:true,...geometry}));await page.close();
  }
  for(const [role,label,destination] of [['student','Student','/student/dashboard'],['tpo','TPO','/tpo/dashboard'],['recruiter','Company','/company/dashboard']]){
   const page=await browser.newPage();let payload;
   await page.route('**/api/**',async route=>{
    const url=route.request().url();if(url.endsWith('/auth/me'))return route.fulfill({status:401,contentType:'application/json',body:JSON.stringify({success:false})});
    if(url.endsWith('/auth/login')){payload=route.request().postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{token:'synthetic-fixture-token',user:{_id:'fixture',name:'Fixture',role}}})});}
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{items:[],stats:{},student:{skills:[]}}})});
   });
   await page.goto('http://127.0.0.1:5173/login');await page.getByRole('combobox',{name:'Select role',exact:true}).click();await page.getByRole('option',{name:label==='TPO'?'TPO (Training & Placement Officer)':label,exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('fixture@example.test');await page.getByLabel('Password',{exact:true}).fill('SyntheticFixtureOnly');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**'+destination);assert.deepEqual(Object.keys(payload).sort(),['email','password']);assert.equal(await page.locator('.skillsetu-auth').count(),0);console.log(JSON.stringify({role,redirect:destination,requestContractPreserved:true}));await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack);process.exitCode=1;});
