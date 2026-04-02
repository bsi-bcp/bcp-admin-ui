import { constantRoutes } from '@/router'
import Layout from '@/layout'

// 安全加载视图组件 -- 组件缺失时显示 404 而非白屏
function loadView(url) {
  return (resolve) => {
    require([`@/views/${url}`], resolve, () => {
      console.error(`[permission] 视图组件不存在: @/views/${url}`)
      require(['@/views/404'], resolve)
    })
  }
}
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, menus) {
    return new Promise(resolve => {
      const accessedRoutes = []
      if (!menus || !menus.length) {
        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
        return
      }
      menus.forEach(({ code, name, url, children }) => {
        let route
        if (children) {
          const childMenu = children.map(({ code, name, url }) => ({
            path: code,
            component: loadView(url),
            meta: { title: name }
          }))
          route = {
            path: `/${code}`,
            component: Layout,
            meta: { title: name },
            children: childMenu
          }
        } else {
          route = {
            path: `/${code}`,
            component: Layout,
            meta: { title: name },
            children: [{
              path: '',
              component: loadView(url),
              meta: { title: name }
            }]
          }
        }
        accessedRoutes.push(route)
      })
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
