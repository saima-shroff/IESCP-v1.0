import router from "./router.js"
import navbar from "./components/navbar.js"

router.beforeEach((to, from, next) => {
    if(to.name !== 'login' && to.name !== 'register' && !localStorage.getItem('auth-token') ? true: false)
        next({name: 'login'})
    else next()
})

new Vue({
    el:"#app",
    template: `<div>
    <navbar :key='has_changed'/>
    <router-view class="m-3"/></div>`,
    router,
    components: {
        navbar,
    },
    data: {
        has_changed: true,
    },
    watch:{
        $route(){
            this.has_changed= !this.has_changed
        }
    }
})