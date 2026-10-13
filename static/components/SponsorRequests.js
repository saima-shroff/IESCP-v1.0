export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center">Your Ad Requests</h1>
        <div class="row">
            <div class="col-md-4 mb-4" v-for="adRequest in adRequests" :key="adRequest.ad_id">
                <div class="card shadow-sm position-relative">
                    <span 
                        class="badge position-absolute top-0 end-0 m-2"
                        :class="{'bg-danger': adRequest.status === 'Pending'|| adRequest.status === 'Pending Negotiation' ,'bg-success': adRequest.status === 'Accepted','bg-secondary': adRequest.status === 'Rejected'}">
                        {{ adRequest.status }}
                    </span>
                    <div class="card-body">
                        <h5 class="card-title">{{ adRequest.campaign.name}}</h5>
                        <p class="card-text"><strong>Influencer ID:</strong> {{ adRequest.influencer_id }}</p>
                        <p class="card-text"><strong>Requirements:</strong> {{ adRequest.requirements }}</p>

                        <div class="d-flex flex-column">
                            <button class="btn btn-outline-primary btn-sm mb-2" @click="viewDetails(adRequest.ad_id)">
                                View Details
                            </button>
                            <button class="btn btn-outline-warning btn-sm mb-2" @click="editAdRequest(adRequest.ad_id)" v-if="adRequest.status==='Pending' || adRequest.status==='Pending Negotiation'">
                                Edit
                            </button>
                            <button class="btn btn-outline-danger btn-sm mb-2" @click="deleteAdRequest(adRequest.ad_id)">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            adRequests: [],
            InfluencerDetails:[],
            token:localStorage.getItem('auth-token')
        };
    },
    async mounted() {
        const res = await fetch('/api/sponsor-ads',{
            headers:{'Authentication-Token':this.token}
        }); 
        this.adRequests = await res.json();
    },
    methods: {
        viewDetails(adRequestId) {
            this.$router.push(`/ad-request/${adRequestId}`);
        },
        editAdRequest(adRequestId) {
            this.$router.push(`/edit-request/${adRequestId}`);
        },
        async deleteAdRequest(adRequestId) {
            if (confirm('Are you sure you want to delete this ad request?')) {
                const res = await fetch(`/api/ad/${adRequestId}`, {
                    method: 'DELETE',
                    headers:{'Authentication-Token':this.token}
                });
                if (res.ok) {
                    alert('Ad request deleted successfully!');
                    this.adRequests = this.adRequests.filter(req => req.ad_id !== adRequestId);
                } else {
                    alert('Failed to delete ad request');
                }
            }
        },
    },
};