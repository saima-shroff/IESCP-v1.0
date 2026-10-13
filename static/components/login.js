export default {
    template:`<div class='d-flex justify-content-center' style='margin-top: 10vh'>
        <div class="mb-3 p-5 bg-light">
            <div class='text-danger'>{{error}}</div>
            <label for="user-email" class="form-label">Email address</label>
            <input type="email" class="form-control" id="user-email" placeholder="name@example.com" v-model="cred.email">
            <label for="user-password" class="form-label">Password</label>
            <input type="password" class="form-control" id="user-password" v-model='cred.password'>
            <button class="btn btn-primary mt-2" @click='login'>Login</button>
            <div>
                New User?
                <router-link class="link" to="/register">Register Here</router-link>
            </div>
        </div>
    </div>`,
    data(){
        return{
            cred:{
                email: null,
                password: null,
            },
            error:null,
        }
    },
    methods: {
        async login(){
            const res = await fetch('/user_login', {
                method:'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.cred),
            })
            const data = await res.json()
            if(res.ok){
                localStorage.setItem('auth-token', data.token)
                localStorage.setItem('role', data.role)
                if(data.role==='influencer'){
                    localStorage.setItem('user-id',data.id)
                }
                if(data.role==='sponsor'){
                    localStorage.setItem('user-id',data.id)
                }
                this.$router.push('/')
            }else{
                this.error = data.message
                console.log(error)
            }
        },
    },
}