import Cookies from 'js-cookie'

const TokenKey = 'VSESSIONID'// 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  if (process.env.NODE_ENV === 'production') {
    return Cookies.set(TokenKey, token, { secure: true, sameSite: 'Strict' })
  }
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
