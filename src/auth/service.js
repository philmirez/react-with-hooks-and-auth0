import * as Auth0 from 'auth0-js'

class Auth {
  auth0 = new Auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH0_DOMAIN,
    clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    redirectUri: process.env.REACT_APP_AUTH0_REDIRECT_URL,
    audience: process.env.REACT_APP_AUTH0_AUDIENCE,
    responseType: 'id_token token',
    scope: 'openid profile email',
  })

  loginCallback = () => {}
  logoutCallback = () => {}

  userProfile = null
  authFlag = 'isLoggedIn'
  authStatus = this.isAuthenticated // we will create isAuthenticated soon
    ? 'init_with_auth_flag'
    : 'init_no_auth_flag'
  idToken = null
  idTokenPayload = null
  accessToken

  handleAuth() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) return reject(err);
        if (!authResult || !authResult.idToken) {
          // not logged in
          return resolve();
        }
        this.localLogin(authResult)
        this.accessToken = authResult.accessToken
        resolve()
      });
    });
  }

  localLogin(authResult) {
    localStorage.setItem(this.authFlag, true)
    this.idToken = authResult.idToken
    this.userProfile = authResult.idTokenPayload
    this.accessToken = authResult.accessToken
    this.loginCallback({ loggedIn: true })
  }

  localLogout() {
    localStorage.removeItem(this.authFlag)
    this.userProfile = null
    this.logoutCallback({ loggedIn: false })
  }

  getAccessToken() {
    return this.accessToken
  }

  login() {
    this.auth0.authorize();
  }

  isAuthenticated() {
    return localStorage.getItem(this.authFlag) === 'true'
  }

  logout() {
    this.localLogout()
    this.auth0.logout({
      returnTo: process.env.REACT_APP_AUTH0_LOGOUT_URL,
      clientID: process.env.REACT_APP_AUTH0_CLIENT_ID,
    })
  }
}

const auth = new Auth()

export default auth
