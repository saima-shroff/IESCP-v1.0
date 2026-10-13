export default {
    template: `
    <div class="container mt-5">
        <div v-if="error" class="alert alert-danger text-center">
            Error: {{ error }}
        </div>
        <div v-if="campaign" class="card shadow-sm">
            <div class="card-body">
                <div class="text-end">
                    <span class="badge bg-primary">{{campaign.niche}}</span>
                </div>
                <h3 class="card-title">{{ campaign.name }}</h3>
                <p class="card-text">{{ campaign.description }}</p>
                <p><strong>Start Date:</strong> {{ campaign.start_date }}</p>
                <p><strong>End Date:</strong> {{ campaign.end_date }}</p>
                <p><strong>Budget:</strong> {{ campaign.budget }}</p>
                <p><strong>Goals:</strong> {{ campaign.goals }}</p>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            campaign: null,
            error: null,
            token: localStorage.getItem('auth-token'),
            campaignId: this.$route.params.id,
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
            this.error = `Error: ${res.status}`;
        }
    },
};