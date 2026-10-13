import adminHome from "./admin_dashboard.js"
import sponsorHome from "./sponsor_dashboard.js"
import influencerHome from "./influencer_dashboard.js"

export default {
    template:`<div> 
        <adminHome v-if="userRole=='admin'"/>
        <sponsorHome v-if='userRole=="sponsor"'/>
        <influencerHome v-if='userRole=="influencer"'/>
     </div>`,
    data(){
        return {
            userRole: localStorage.getItem('role'),
        }
    },
    components:{
        adminHome,
        sponsorHome,
        influencerHome,
    },
}