export default {
    template: `
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/">Home</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item" v-if="role=='admin'">
            <router-link class="nav-link" to="/users">Users</router-link>
          </li>
          <li class="nav-item" v-if="role=='sponsor'">
            <router-link class="nav-link" to="/create-campaign">Add Campaign</router-link>
          </li>
          <li class="nav-item" v-if="role=='sponsor'">
            <router-link class="nav-link" to="/all-requests">Ad Requests</router-link>
          </li>
          <li class="nav-item" v-if="role=='sponsor'">
            <router-link class="nav-link" to="/search-influencers">Influencers</router-link>
          </li>
          <li class="nav-item" v-if="role=='influencer'">
            <router-link class="nav-link" to="/all-campaigns">Campaigns</router-link>
          </li>
          <li class="nav-item" v-if="role=='influencer'">
            <router-link class="nav-link" to="/ad-requests">Ad Requests</router-link>
          </li>
          <li class="nav-item" v-if="is_login">
            <span class="nav-link" @click='logout'>Logout</span>
          </li>
        </ul>
      </div>
    </div>
  </nav>`,
data(){
  return{
    role: localStorage.getItem('role'),
    is_login : localStorage.getItem('auth-token'),
  }
},
methods: {
  logout(){
    localStorage.removeItem('auth-token')
    localStorage.removeItem('role')
    localStorage.removeItem('user-id')
    this.$router.push({path: '/login'})
  },
},
}