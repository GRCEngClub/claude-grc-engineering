// Exercise actual Cognito SDK token caching and refresh; only transport/auth entry is controlled.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { transformWithOxc } from 'vite'
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

let source = await readFile('src/hooks/useAuth.jsx', 'utf8')
source = source.replace(/import \{[\s\S]*?\} from 'react'/, '').replace(/import \{[\s\S]*?\} from 'amazon-cognito-identity-js'/, '')
  .replaceAll('import.meta.env', JSON.stringify({VITE_USER_POOL_ID:'us-east-1_pool', VITE_USER_POOL_CLIENT_ID:'client'})).replaceAll('export function ', 'function ')
const compiled = await transformWithOxc(source, 'useAuth.jsx', {jsx:{runtime:'classic'}})
globalThis.localStorage = {length:0}
let attempts = [], pools = [], requests = []
class Pool extends CognitoUserPool {
  constructor(options) { super(options); pools.push(this); this.client.requestWithRetry = (operation, params, cb) => requests.push({operation, params, cb}) }
}
class User extends CognitoUser {
  authenticateUser(details, cb) { attempts.push({user:this, cb}) }
}
let hooks=[], index=0
const React={createElement:(type,props)=>({type,props})}
const useState=initial=>{const i=index++; if (!(i in hooks)) hooks[i]=initial; return [hooks[i], v=>{hooks[i]=v}]}
const useRef=initial=>{const i=index++; if (!(i in hooks)) hooks[i]={current:initial}; return hooks[i]}
const Provider=new Function('React','createContext','useContext','useState','useRef','useEffect','useCallback','CognitoUserPool','CognitoUser','AuthenticationDetails',compiled.code+';return AuthProvider')(React,()=>({}),()=>null,useState,useRef,()=>{},f=>f,Pool,User,AuthenticationDetails)
const render=()=>{index=0;return Provider({}).props.value}
const now=Math.floor(Date.now()/1000)
const jwt=(email, exp)=>['e30',Buffer.from(JSON.stringify({email,iat:now,exp})).toString('base64url'),'signature'].join('.')
const result=(email, exp=now+3600)=>({AuthenticationResult:{IdToken:jwt(email,exp),AccessToken:jwt(email,exp),RefreshToken:'refresh-'+email}})
const complete=(attempt,email,exp=now+3600)=>attempt.user.authenticateUserInternal(result(email,exp),{},attempt.cb)
const key=(name, type)=>`CognitoIdentityServiceProvider.client.${name}.${type}`
const auth=render()
const a=auth.login('a','pw'), b=auth.login('b','pw')
complete(attempts[1],'b',now-10); await b
complete(attempts[0],'a'); await assert.rejects(a,/cancelled/)
assert.equal(pools[0].storage.getItem(key('a','refreshToken')),null)
assert.equal(pools[1].storage.getItem(key('b','refreshToken')),'refresh-b')
assert.equal(render().user.email,'b')
const refresh=auth.getToken(), refresh2=auth.getToken()
assert.equal(requests.length,1); assert.equal(requests[0].operation,'InitiateAuth')
assert.equal(requests[0].params.AuthParameters.REFRESH_TOKEN,'refresh-b')
const c=auth.login('c','pw'); complete(attempts[2],'c'); await c
requests[0].cb(null,result('stale'))
await assert.rejects(refresh,/ended/); await assert.rejects(refresh2,/ended/)
assert.equal(pools[1].storage.getItem(key('b','idToken')),null)
assert.equal(pools[2].storage.getItem(key('c','refreshToken')),'refresh-c')
assert.equal(render().user.email,'c')
const d=auth.login('d','pw'); auth.logout(); complete(attempts[3],'d'); await assert.rejects(d,/cancelled/)
assert.equal(pools[3].storage.getItem(key('d','refreshToken')),null)
assert.equal(render().user,null)
const e=auth.login('e','pw'); complete(attempts[4],'e',now-10); await e
const first=auth.getToken(), second=auth.getToken()
assert.equal(requests.length,2)
requests[1].cb(null,result('e-new'))
assert.equal(await first, jwt('e-new',now+3600)); assert.equal(await second, jwt('e-new',now+3600))
assert.equal(pools[4].storage.getItem(key('e','refreshToken')),'refresh-e-new')
assert.equal(await auth.getToken(), jwt('e-new',now+3600)); assert.equal(requests.length,2)
console.log('Real Cognito SDK cacheTokens and refresh races passed (offline transport).')
