import request from '@/utils/request'
import qs from 'qs'

// sso登录
export function ssoLogin(params) {
  console.log(`/authLogin?tenant=${params.tenant}&code=${params.code}`)
  return request({
    url: `/authLogin?tenant=${params.tenant}&code=${params.code}`,
    method: 'get',
    params
  })
}
