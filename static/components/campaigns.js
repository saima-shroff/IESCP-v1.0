export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center">Search Campaigns</h1>

        <form class="mb-4 shadow-sm p-4 bg-light" @submit.prevent="fetchCampaigns">
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="name" class="form-label">Campaign Name</label>
                    <input type="text" id="name" v-model="searchCriteria.name" class="form-control" placeholder="Search by name"/>
                </div>
                <div class="col-md-6">
                    <label for="niche" class="form-label">Campaign Niche</label>
                    <input type="text" id="niche" v-model="searchCriteria.niche" class="form-control" placeholder="Search by niche"/>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Search</button>
        </form>

        <div v-if="campaigns.length === 0" class="text-center text-muted">
            <p>No campaigns found</p>
        </div>
        <div v-else class="row">
            <div class="col-md-4 mb-4" v-for="campaign in campaigns" :key="campaign.id">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">{{ campaign.name }}</h5>
                        <p class="card-text"><strong>Niche:</strong> {{ campaign.niche }}</p>
                        <p class="card-text">{{ campaign.description }}</p>
                        <button class="btn btn-outline-primary btn-sm" @click="viewDetails(campaign.id)">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            searchCriteria: {
                name: '',
                niche: '',
            },
            campaigns: [],
            token:localStorage.getItem('auth-token')
        };
    },
    async mounted() {
        await this.fetchCampaigns();
    },
    methods: {
        async fetchCampaigns() {
            const queryParams = new URLSearchParams(this.searchCriteria).toString();
            const res = await fetch(`/api/campaign-search?${queryParams}`,{
                headers:{'Authentication-Token':this.token}
            });
            if (res.ok) {
                this.campaigns = await res.json();
            } else {
                alert('Failed to fetch campaigns');
            }
        },
        viewDetails(campaignId) {
            this.$router.push(`/campaign/${campaignId}`);
        },
    },
};