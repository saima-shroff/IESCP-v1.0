import home from "./components/home.js"
import login from "./components/login.js"
import users from "./components/users.js"
import campaign from "./components/CampaignForm.js"
import register from "./components/register.js"
import adRequest from "./components/AdRequestForm.js"
import editCampaign from "./components/EditCampaignForm.js"
import editRequest from "./components/EditRequestForm.js"
import profile from "./components/InfluencerProfile.js"
import editProfile from "./components/EditProfile.js"
import allCampaigns from "./components/campaigns.js"
import allRequests from "./components/adRequests.js"
import CampaignDetails from "./components/CampaignDetails.js"
import RequestDetails from './components/RequestDetails.js'
import AllRequests from "./components/SponsorRequests.js"
import influencerSearch from "./components/Influencers.js"
import InfluencerProfilePublic from "./components/profileInfluencerPublic.js"

const routes = [
    {path:'/', name:'home', component: home},
    {path:'/login',name:'login', component: login},
    {path:'/users', name:'users' ,component:users},
    {path:'/create-campaign',name:'createCampaign',component:campaign},
    {path:'/register', name:'register', component:register},
    {path:'/campaign/request-ad/:campaign_id', name:'request-ad', component:adRequest},
    {path:'/edit-campaign/:campaign_id',name:'edit-campaign',component:editCampaign},
    {path:'/profile',name:'profile',component:profile},
    {path:'/edit-profile',name:'editProfile',component:editProfile},
    {path:'/all-campaigns',name:'allCampaigns',component:allCampaigns},
    {path:'/ad-requests', name:'allRequests',component:allRequests},
    {path:'/campaign/:id',name:'CampaignDetails',component:CampaignDetails},
    {path:'/ad-request/:id',name:'RequestDetails',component:RequestDetails},
    {path:'/all-requests',name:'allrequests',component:AllRequests},
    {path:'/edit-request/:id', name:'editRequests',component:editRequest},
    {path:'/search-influencers', name:'SearchInfluencers',component:influencerSearch},
    {path:'/influencer-profile/:id',name:'InfluencerProfilePublic',component:InfluencerProfilePublic},
]

export default new VueRouter({
    routes,
})