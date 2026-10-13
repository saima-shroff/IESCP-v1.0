export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center">Search Influencers</h1>

        <form class="mb-4 shadow-sm p-4 bg-light" @submit.prevent="fetchInfluencers">
            <div class="row mb-3">
                <div class="col-md-4">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" id="name" v-model="searchCriteria.name" class="form-control" placeholder="Search by name" />
                </div>
                <div class="col-md-4">
                    <label for="niche" class="form-label">Niche</label>
                    <input type="text" id="niche" v-model="searchCriteria.niche" class="form-control" placeholder="Search by niche" />
                </div>
                <div class="col-md-4">
                    <label for="min_followers" class="form-label">Minimum Followers</label>
                    <input type="number" id="min_followers" v-model="searchCriteria.min_followers" class="form-control" placeholder="Minimum followers" />
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Search</button>
        </form>

        <div v-if="influencers.length === 0" class="text-center text-muted">
            <p>No influencers found</p>
        </div>
        <div v-else class="row">
            <div class="col-md-4 mb-4" v-for="influencer in influencers" :key="influencer.id">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">{{ influencer.name}}</h5>
                        <p class="card-text"><strong>Niche:</strong> {{ influencer.niche }}</p>
                        <p class="card-text"><strong>Followers:</strong> {{ influencer.reach}}</p>
                        <button class="btn btn-outline-primary btn-sm" @click="viewProfile(influencer.user_id)">
                            View Profile
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
                min_followers: 0,
            },
            influencers: [],
            token: localStorage.getItem('auth-token'),
        };
    },
    async mounted() {
        await this.fetchInfluencers();
    },
    methods: {
        async fetchInfluencers() {
            const queryParams = new URLSearchParams(this.searchCriteria).toString();
            const res = await fetch(`/influencer?${queryParams}`,{
                headers:{'Authentication-Token':this.token},
            });
            if (res.ok) {
                this.influencers = await res.json();
            } else {
                alert('Failed to fetch influencers');
            }
        },
        viewProfile(influencerId) {
            this.$router.push(`/influencer-profile/${influencerId}`);
        },
    },
};