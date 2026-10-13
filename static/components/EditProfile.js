export default{
    template:`
    <div>
        <div v-if="error">
            Error: {{error}}
        </div>
        <div v-if="influencer">
            <form>
            <input type='text' placeholder='name' v-model="influencer.name" />
            <input type='text' placeholder='social handle' v-model="influencer.social_handle"/>
            <input type='number' placeholder='reach' v-model="influencer.reach"/>
            <input type='text' placeholder='niche' v-model="influencer.niche"/>
            <button @click="editProfile()">Confirm Changes</button>
            </form>
        </div>
    </div>`,
    data(){
        return{
            influencer:{
                name:null,
                social_handle : null,
                reach: null,
                niche: null,
            },
            token:localStorage.getItem('auth-token'),
            userId:localStorage.getItem('user-id'),
            error: null,
        }
    },
    async mounted(){
        const res = await fetch(`/influencer/${this.userId}`,{
            headers:{
                'Authentication-Token': this.token,
            }
        })
        const data = res.json().catch((e)=>{})
        if(res.ok){
            this.influencer.name = data.name
        }else{
            this.error = res.status
        }
    },
    methods:{
        async editProfile(){
            const update = await fetch(`/influencer/${this.userId}`,{
                method : "PUT",
                headers : {
                    'Content-Type':"application/json",
                    'Authentication-Token' : this.token,
                },
                body: JSON.stringify(this.influencer),
            })
            const mes = await update.json()
            if(update.ok){
                alert(mes.message)
                this.$router.push('/')
            }else{
                alert(mes.message)
            }
        }
    }
}
