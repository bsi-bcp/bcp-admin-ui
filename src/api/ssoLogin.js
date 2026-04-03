import request from '@/utils/request'

// sso登录
export function ssoLogin(params) {
  return request({
    url: '/authLogin',
    method: 'get',
    params
  })
}
