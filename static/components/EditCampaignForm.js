export default {
    template: `
    <div class="container mt-5">
        <h2 class="text-center">Edit Campaign</h2>
        <form class="p-4 shadow-sm bg-light">
            <div class="mb-3">
                <label for="name" class="form-label">Campaign Name</label>
                <input type="text" class="form-control" id="name" v-model="campaign.name" readonly>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" v-model="campaign.description" rows="3" readonly></textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Niche</label>
                <div class="form-control bg-light text-muted">{{ campaign.niche }}</div>
            </div>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label for="start_date" class="form-label">Start Date</label>
                    <input type="date" class="form-control" id="start_date" v-model="campaign.start_date">
                </div>
                <div class="col-md-6 mb-3">
                    <label for="end_date" class="form-label">End Date</label>
                    <input type="date" class="form-control" id="end_date" v-model="campaign.end_date">
                </div>
            </div>
            <div class="mb-3">
                <label for="budget" class="form-label">Budget</label>
                <input type="number" class="form-control" id="budget" v-model="campaign.budget" placeholder="Enter new budget">
            </div>
            <div class="mb-3">
                <label for="goals" class="form-label">Goals</label>
                <textarea class="form-control" id="goals" v-model="campaign.goals" rows="3" placeholder="Update campaign goals"></textarea>
            </div>
            <div class="text-center">
                <button type="button" class="btn btn-primary me-3" @click="updateCampaign">Save Changes</button>
                <router-link to="/" class="btn btn-secondary">Cancel</router-link>
            </div>
        </form>
    </div>
    `,
    data() {
        return {
            campaign: {
                name: null,
                description: null,
                start_date: null,
                end_date: null,
                budget: null,
                niche: null, 
                goals: null,
            },
            token: localStorage.getItem('auth-token'),
            campaignId: this.$route.params.campaign_id, 
        };
    },
    async mounted() {
        const res = await fetch(`/api/campaign/${this.campaignId}`, {
            headers: { 'Authentication-Token': this.token },
        });
        const data = await res.json();
        if (res.ok) {
            this.campaign = data;
        } else {
            alert(`Failed to fetch campaign details: ${data.message}`);
        }
    },
    methods: {
        async updateCampaign() {
            const updatedData = {
                start_date: this.campaign.start_date,
                end_date: this.campaign.end_date,
                budget: this.campaign.budget,
                goals: this.campaign.goals,
            };

            const res = await fetch(`/api/campaign/${this.campaignId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token,
                },
                body: JSON.stringify(updatedData),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Campaign updated successfully!');
                this.$router.push('/');
            } else {
                alert(`Error: ${data.message}`);
            }
        },
    },
}