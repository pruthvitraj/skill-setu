// Browser checks use synthetic API fixtures; no account, provider or database calls.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({headless:true,channel:process.env.LEARNING_BROWSER_CHANNEL || 'msedge'});
 const screenshots=path.resolve(__dirname,'../../docs/design/screenshots/combined-learning-search');fs.mkdirSync(screenshots,{recursive:true});
 try {
  for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]) {
   const page=await browser.newPage({viewport:{width,height}});const calls=[];let resourceFails=true;
   await page.route('**/api/**',async route=>{
    const url=new URL(route.request().url());let data={items:[]},status=200,body;
    if(url.pathname.endsWith('/auth/me'))data={user:{_id:'fixture-student',name:'Synthetic student',email:'fixture@example.test',role:'student'}};
    else if(url.pathname.endsWith('/courses/youtube')){calls.push(['courses',url.searchParams.get('q')]);data={items:[{id:'fixture-video',type:'video',title:'Synthetic YouTube video',channel:'Fixture channel',thumbnail:null,url:'https://www.youtube.com/watch?v=abcdefghijk'},{id:'fixture-playlist',type:'playlist',title:'Synthetic playlist',channel:'Fixture channel',thumbnail:null,url:'https://www.youtube.com/playlist?list=PLfixture'}],cached:false};}
    else if(url.pathname.endsWith('/courses/resources')){calls.push(['resources',url.searchParams.get('q')]);if(resourceFails){status=503;body={success:false,message:'Synthetic quota error',errorCode:'RESOURCE_QUOTA'};}else data={items:[{title:'Synthetic documentation',source:'react.dev',type:'documentation',description:'A retrieved fixture excerpt.',url:'https://react.dev/learn'}],cached:false};}
    else if(url.pathname.endsWith('/courses'))data={items:[{_id:'saved-fixture',title:'Saved catalog fixture',provider:'Fixture',skill:'React',url:'https://react.dev/learn'}],pagination:{page:1,pages:1,total:1}};
    await route.fulfill({status,contentType:'application/json',body:JSON.stringify(body||{success:true,data})});
   });
   await page.goto(process.env.LEARNING_TEST_URL||'http://127.0.0.1:5173/student/courses');
   const input=page.getByLabel('Topic or skill',{exact:true});await input.waitFor();
   assert.equal(await input.count(),1);assert.equal(calls.length,0);
   assert.equal(await page.locator('section[aria-labelledby="youtube-resources"], section[aria-labelledby="online-resources"]').count(),0);
   await input.fill('  React Hooks  ');await page.getByRole('button',{name:'Search',exact:true}).click();
   await page.getByText('Synthetic YouTube video',{exact:true}).waitFor();await page.getByText('Synthetic quota error',{exact:true}).waitFor();
   assert.deepEqual(calls,[['courses','React Hooks'],['resources','React Hooks']]);
   resourceFails=false;await page.getByRole('button',{name:'Retry search',exact:true}).click();await page.getByText('Synthetic documentation',{exact:true}).waitFor();
   assert.equal(calls.filter(([group])=>group==='courses').length,1);assert.equal(calls.filter(([group])=>group==='resources').length,2);
   assert.equal(await page.getByText('Saved catalog fixture',{exact:true}).count(),0);
   const geometry=await page.evaluate(()=>{
    const courses=document.querySelector('section[aria-labelledby="youtube-resources"]').getBoundingClientRect();const resources=document.querySelector('section[aria-labelledby="online-resources"]').getBoundingClientRect();
    const input=document.querySelector('input[placeholder="React Hooks, SQL joins, Docker…"]').getBoundingClientRect();const submit=document.querySelector('form button[type="submit"]').getBoundingClientRect();
    return {gap:resources.top-courses.bottom,overflow:document.documentElement.scrollWidth>window.innerWidth,input:{x:input.x,y:input.y,width:input.width,height:input.height},button:{x:submit.x,y:submit.y,width:submit.width,height:submit.height}};
   });
   assert.ok(Math.abs(geometry.gap-24)<1);assert.equal(geometry.overflow,false);
   if(name==='desktop')assert.ok(Math.abs((geometry.input.y+geometry.input.height/2)-(geometry.button.y+geometry.button.height/2))<8);
   else assert.ok(geometry.button.y>=geometry.input.y+geometry.input.height);
   await page.screenshot({path:path.join(screenshots,`${name}.png`),fullPage:true});
   await input.fill('SQL');await input.press('Enter');await page.waitForFunction(()=>document.querySelector('section[aria-labelledby="online-resources"]')?.textContent.includes('for “SQL”'));
   assert.deepEqual(calls.slice(-2),[['courses','SQL'],['resources','SQL']]);
   console.log(JSON.stringify({viewport:name,oneClickBothGroups:true,partialFailureAndIndependentRetry:true,keyboardSubmit:true,savedCatalogAbsent:true,...geometry}));await page.close();
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
