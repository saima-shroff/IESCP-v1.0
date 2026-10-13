export default {
    template: `<div class="container mt-5">
    <h1 class="text-center">Create Ad Request</h1>
    <form class="shadow-sm p-4 bg-light" @submit.prevent="submitAdRequest">
        <div class="mb-3">
            <label class="form-label">Campaign</label>
            <input type="text" class="form-control" :value="campaign.name" readonly />
        </div>
        <div class="mb-3">
            <label for="influencer_id" class="form-label">Select Influencer</label>
            <select
                id="influencer_id"
                class="form-select"
                v-model="adRequest.influencer_id"
                :disabled="!influencers.length"
                required>
                <option value="" disabled selected>Select an influencer</option> <!-- Placeholder -->
                <option v-for="influencer in influencers" :value="influencer.user_id" :key="influencer.id">
                    {{ influencer.name }}
                </option>
            </select>
            <p v-if="!influencers.length" class="text-danger mt-2">
                No influencers available for this campaign's niche.
            </p>
        </div>
        <div class="mb-3">
            <label for="requirements" class="form-label">Requirements</label>
            <textarea class="form-control" v-model="adRequest.requirements" required></textarea>
        </div>
        <div class="mb-3">
            <label for="payment_amount" class="form-label">Payment Amount</label>
            <input type="number" class="form-control" v-model="adRequest.payment_amount" required />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="!influencers.length">Submit </button>
    </form>
</div>
`,
data() {
    return {
        campaign: {}, 
        influencers: [], 
        adRequest: {
            influencer_id: null,
            requirements: '',
            payment_amount: '',
        },
        token: localStorage.getItem('auth-token')
    };
},
async mounted() {
    const campaignId = this.$route.params.campaign_id;

    const campaignRes = await fetch(`/api/campaign/${campaignId}`,{
        headers: { 'Authentication-Token':this.token}
    });
    this.campaign = await campaignRes.json();

    const influencersRes = await fetch(`/influencer?niche=${this.campaign.niche}`,{
        headers:{'Authentication-Token':this.token}
    });
    if (influencersRes.ok) {
        this.influencers = await influencersRes.json();
    } else {
        alert('Failed to fetch influencers');
    }
},
methods: {
    async submitAdRequest() {
        const res = await fetch('/api/ad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authentication-Token':this.token },
            body: JSON.stringify({
                campaign_id: this.campaign.campaign_id,
                influencer_id: this.adRequest.influencer_id,
                requirements: this.adRequest.requirements,
                payment_amount: this.adRequest.payment_amount
            }),
            
        });
        if (res.ok) {
            alert('Ad request created successfully!');
            this.$router.push('/all-requests'); 
        } else {
            alert('Failed to create ad request');
        }
    },
},
};