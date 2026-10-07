const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const calls=[];let profiles=0;
 await page.route('**/api/**',async route=>{
 const url=new URL(route.request().url()),q=url.searchParams.get('q');let data={items:[]};
 if(url.pathname.endsWith('/auth/me'))data={user:{_id:'fixture',name:'Fixture student',role:'student'}};
 if(url.pathname.endsWith('/courses/recommended'))profiles++;
 if(url.pathname.endsWith('/courses/youtube')){calls.push(['youtube',q]);await new Promise(resolve=>setTimeout(resolve,100));data={items:[{id:q,type:'video',title:q+' video',channel:'Returned channel',url:'https://www.youtube.com/watch?v=fixture'},{id:'unrelated',type:'video',title:'Cooking basics',channel:'Unrelated',url:'https://www.youtube.com/watch?v=unrelated'}]};}
 if(url.pathname.endsWith('/courses/resources')){calls.push(['resources',q]);await new Promise(resolve=>setTimeout(resolve,100));data={items:[{title:q+' official guide',source:'docs.example.test',type:'documentation',description:'Official '+q+' learning guidance.',url:'https://docs.example.test/'+encodeURIComponent(q)},{title:q+' repository',source:'github.com',type:'repository',description:'Learn '+q,url:'https://github.com/fixture/example'}]};}
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
 });
 await page.goto('http://127.0.0.1:5173/student/courses');const input=page.getByLabel('Topic or skill',{exact:true});await input.waitFor();const section=page.locator('section[aria-labelledby="search-recommendations"]');assert.equal(await section.count(),0);
 for(const q of ['React Hooks','SQL joins','Docker']){
 await input.fill(q);await page.getByRole('button',{name:'Search',exact:true}).click();assert.equal(await section.count(),0);await section.waitFor();
 assert.equal(await section.locator('article').count(),3);assert.equal(await section.locator('article h3').first().innerText(),q+' official guide');assert.equal(await section.locator('article').filter({hasText:'Cooking basics'}).count(),0);
 const link=await section.locator('article a').first().getAttribute('href');assert.equal(link,'https://docs.example.test/'+encodeURIComponent(q));
 }
 assert.equal(profiles,0);assert.deepEqual(calls,[['youtube','React Hooks'],['resources','React Hooks'],['youtube','SQL joins'],['resources','SQL joins'],['youtube','Docker'],['resources','Docker']]);console.log(JSON.stringify({topics:['React Hooks','SQL joins','Docker'],hiddenBeforeSearch:true,clearedOnNewSearch:true,exactOfficialFirst:true,preservedLinks:true,searchCalls:6,profileRecommendationCalls:0}));
 }finally{await browser.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;});
