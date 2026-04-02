import { login, logout, getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  orgName: '',
  avatar: '',
  roles: [],
  cur_user: {}
}

const mutations = {
  SET_CURUSER: (state, user) => {
    state.cur_user = user
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_ORGNAME: (state, orgName) => {
    state.orgName = orgName
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { uname, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ uname: uname.trim(), password: password }).then(response => {
        //  为了兼容之前的设计，后台把jsessioid放到了mresponse.msg里面
        commit('SET_TOKEN', response.msg)
        setToken(response.msg)
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },
  // user set token
  token({ commit }, token) {
    return new Promise((resolve, reject) => {
      commit('SET_TOKEN', token)
      setToken(token)
      resolve()
    })
  },
  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getUserInfo(state.token).then(response => {
        const { model } = response
        if (!model) {
          reject('验证失败, 请重新登录.')
        }
        const { userType, name, orgName } = model

        // roles must be a non-empty array
        if (!userType || userType === '') {
          reject('getInfo: user type must be a non-null string!')
        }

        commit('SET_ROLES', userType)
        commit('SET_NAME', name)
        commit('SET_ORGNAME', orgName)
        commit('SET_CURUSER', model)

        //  commit('SET_AVATAR', avatar)
        resolve(model)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

