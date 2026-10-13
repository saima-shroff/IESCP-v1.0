export default{
    template:`
    <div>
        <div v-if='error'>
            <p> Error : {{error}} </p>
        </div>
        <div v-if='inf'>
            <div class='d-flex justify-content-center' style='margin-top: 10vh'>
            <div class="mb-3 p-5 bg-light">
                <h2>Welcome, {{inf.name}}</h2><br>
                <div><h4>Social Handle:</h4>@{{inf.social_handle}}</div><br>
                <div><h4>Reach:</h4>{{inf.reach}} followers </div><br>
                <div><h4>Niche:</h4>{{inf.niche}}</div><br>
                <div><button @click="editProfile" class="btn btn-secondary">Edit Profile</button></div>
            </div>
            </div>
        </div>
    </div>`,
    data(){
        return{
            influencerId : localStorage.getItem('user-id'),
            inf: null,
            token: localStorage.getItem('auth-token'),
            error:null
        }
    },
    async mounted(){
        const res = await fetch(`/influencer/${this.influencerId}`,{
            headers:{
                'Authentication-Token':this.token,
            }
        })
        const data = await res.json().catch((e)=>{})
        if(res.ok){
            this.inf = data
        }else{
            this.error = res.status
        }
    },
    methods:{
        editProfile(){
            this.$router.push('/edit-profile')
        }
    }
}