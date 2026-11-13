import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'
import router from '@/router'
import { ref, computed } from 'vue'

// Set from the page boot under mPass SSO: Frappe's own login page would sign the user straight back in.
function platformLogoutUrl() {
  const url = window.mpass_logout_url
  return typeof url === 'string' && url ? url : null
}

export const sessionStore = defineStore('crm-session', () => {
  function sessionUser() {
    let cookies = new URLSearchParams(document.cookie.split('; ').join('&'))
    let _sessionUser = cookies.get('user_id')
    if (_sessionUser === 'Guest') {
      _sessionUser = null
    }
    return _sessionUser
  }

  let user = ref(sessionUser())
  const isLoggedIn = computed(() => !!user.value)

  const login = createResource({
    url: 'login',
    onError() {
      throw new Error(__('Invalid Email or Password'))
    },
    onSuccess() {
      user.value = sessionUser()
      login.reset()
      router.replace({ path: '/' })
    },
  })

  const logout = createResource({
    url: 'logout',
    onSuccess() {
      user.value = null
      window.location.href = platformLogoutUrl() || '/login?redirect-to=/crm'
    },
  })

  return {
    user,
    isLoggedIn,
    login,
    logout,
  }
})
