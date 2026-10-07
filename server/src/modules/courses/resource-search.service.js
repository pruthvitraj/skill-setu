const env = require('../../config/env');
const { AppError } = require('../../utils/AppError');
const { readBounded } = require('../../integrations/ai/json-adapter');
const ENDPOINT = 'https://api.tavily.com/search';
const groups = [
  { type: 'documentation', domains: ['react.dev','developer.mozilla.org','docs.docker.com','docs.python.org','www.postgresql.org','dev.mysql.com','sqlite.org','nodejs.org','kubernetes.io','learn.microsoft.com','git-scm.com'], suffix: 'official documentation tutorial' },
  { type: 'article', domains: ['freecodecamp.org','digitalocean.com','dev.to','web.dev','css-tricks.com'], suffix: 'educational tutorial article' },
  { type: 'repository', domains: ['github.com'], suffix: 'learning tutorial public repository' },
];
function queryText(input) {
  if (typeof input !== 'string' || input.length > 100 || /[\x00-\x1f\x7f]/.test(input)) throw new AppError('Enter a skill or topic of 2–100 characters.',422,'RESOURCE_QUERY_INVALID');
  const query=input.trim().replace(/\s+/g,' ');
  if(query.length<2)throw new AppError('Enter a skill or topic of 2–100 characters.',422,'RESOURCE_QUERY_INVALID');
  return query;
}
function mapResult(result, group) {
  if (typeof result?.title !== 'string' || !result.title.trim() || typeof result.content !== 'string' || typeof result.url !== 'string') return null;
  let url;
  try { url=new URL(result.url); } catch { return null; }
  if(url.protocol!=='https:' || url.username || url.password || url.port || !group.domains.some(domain=>url.hostname===domain || url.hostname.endsWith(`.${domain}`))) return null;
  // Retain the actual returned URL: never turn issues/profiles into invented repository links.
  if(group.type==='repository' && (!/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname) || /^(\/(topics|collections|orgs|users|settings|marketplace|search))\//.test(url.pathname))) return null;
  return { title:result.title.trim().slice(0,300), source:url.hostname, type:group.type,
    description:result.content.replace(/\s+/g,' ').trim().slice(0,400), url:result.url };
}
function createResourceSearch({key=env.tavilyKey,fetchImpl=(...args)=>fetch(...args),now=Date.now,timeoutMs=12000}={}) {
  const cache=new Map(),pending=new Map();let blockedUntil=0,blockedError;
  async function fetchGroup(query,group){
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
    try{
      const response=await fetchImpl(ENDPOINT,{method:'POST',redirect:'error',signal:controller.signal,
        headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
        body:JSON.stringify({query:`${query} ${group.suffix}`,topic:'general',search_depth:'basic',auto_parameters:false,max_results:3,
          include_domains:group.domains,include_domains_mode:'restrict',safe_search:true,exclude_domains:['youtube.com','youtu.be'],include_answer:false,include_raw_content:false,include_images:false})});
      if(!response.ok){
        await response.body?.cancel();
        if([402,429,432,433].includes(response.status)){
          blockedUntil=now()+3600000;blockedError=new AppError('Online resource search credits or rate limit are exhausted. Searches are paused for one hour. The administrator can check the Tavily free-plan quota; no paid fallback is enabled.',503,'RESOURCE_QUOTA');
        }else if([401,403].includes(response.status)){
          blockedUntil=Infinity;blockedError=new AppError('Tavily rejected the server key or access. Ask the administrator to check TAVILY_API_KEY and restart the backend.',503,'RESOURCE_CONFIG');
        }else throw new AppError('Online resource search is temporarily unavailable. Try again later.',503,'RESOURCE_PROVIDER');
        throw blockedError;
      }
      let data;
      try{data=JSON.parse(await readBounded(response,262144));}catch{if(controller.signal.aborted)throw new Error('timeout');throw new AppError('The search API returned an invalid response. Try again later.',503,'RESOURCE_INVALID_RESPONSE');}
      if(!Array.isArray(data.results))throw new AppError('The search API returned an invalid response. Try again later.',503,'RESOURCE_INVALID_RESPONSE');
      return data.results.slice(0,3).map(result=>mapResult(result,group)).filter(Boolean);
    }catch(error){
      if(error instanceof AppError)throw error;
      throw new AppError(controller.signal.aborted?'Online resource search timed out. Try again.':'Unable to connect to online resource search. Try again later.',503,controller.signal.aborted?'RESOURCE_TIMEOUT':'RESOURCE_PROVIDER');
    }finally{clearTimeout(timer);}
  }
  async function search(input){
    const query=queryText(input),cacheKey=query.toLowerCase();
    if(!key || key!==key.trim())throw new AppError('Online resource search is not configured. Ask the administrator to obtain a Tavily free-plan API key at https://app.tavily.com, set TAVILY_API_KEY in the server environment, and restart the backend.',503,'RESOURCE_CONFIG');
    const existing=cache.get(cacheKey);
    if(existing && existing.expires>now())return {...existing.value,query,cached:true};
    if(blockedUntil>now())throw blockedError;
    if(pending.has(cacheKey))return pending.get(cacheKey);
    if(pending.size>=10)throw new AppError('Online resource search is busy. Try again shortly.',503,'RESOURCE_BUSY');
    const request=(async()=>{
      // Three basic searches cover each requested type; no generated answers or AI links.
      const results=await Promise.all(groups.map(group=>fetchGroup(query,group)));
      const items=[...new Map(results.flat().map(item=>[item.url,item])).values()].slice(0,9);
      const value={query,items,provider:'tavily',retrievedAt:new Date(now()).toISOString()};
      if(cache.size>=100)cache.delete(cache.keys().next().value);
      cache.set(cacheKey,{value,expires:now()+900000});return {...value,cached:false};
    })().finally(()=>pending.delete(cacheKey));
    pending.set(cacheKey,request);return request;
  }
  return {search};
}
const service=createResourceSearch();
module.exports={search:service.search,createResourceSearch,mapResult,queryText,ENDPOINT};
