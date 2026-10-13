export default {
    template: `
    <div class="container mt-5">
        <h2 class="text-center">Edit Request</h2>
        <form class="p-4 shadow-sm bg-light">
            <div class="mb-3">
                <label for="name" class="form-label">Campaign Name</label>
                <input type="text" class="form-control" id="name" v-model="request.campaign.name" readonly>
            </div>
            <div class="mb-3">
                <label class="form-label">Influencer ID</label>
                <div class="form-control bg-light ">{{ request.influencer_id }}</div>
            </div>
            <div class="mb-3">
                <label for="payment_amount" class="form-label">Payment Amount</label>
                <input type="number" class="form-control" id="payment_amount" v-model="request.payment_amount" placeholder="Enter new payment amount">
            </div>
            <div class="mb-3">
                <label for="requirements" class="form-label">Requirements</label>
                <textarea class="form-control" id="requirements" v-model="request.requirements" rows="3" placeholder="Update request requirements"></textarea>
            </div>
            <div class="text-center">
                <button type="button" class="btn btn-primary me-3" @click="updateRequest">Save Changes</button>
                <router-link to="/" class="btn btn-secondary">Cancel</router-link>
            </div>
        </form>
    </div>
    `,
    data() {
        return {
            request: {
                campaign_id: null,
                influencer_id: null,
                requirements: null,
                payment_amount: null,
            },
            token: localStorage.getItem('auth-token'),
            RequestId: this.$route.params.id, 
        };
    },
    async mounted() {
        const res = await fetch(`/api/ad/${this.RequestId}`, {
            headers: { 'Authentication-Token': this.token },
        });
        const data = await res.json();
        if (res.ok) {
            this.request = data;
        } else {
            alert(`Failed to fetch request details: ${data.message}`);
        }
    },
    methods: {
        async updateRequest() {
            const updatedData = {
                influencer_id: this.request.influencer_id,
                requirements: this.request.requirements,
                payment_amount: this.request.payment_amount,
            };

            const res = await fetch(`/api/ad/${this.RequestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token,
                },
                body: JSON.stringify(updatedData),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Request updated successfully!');
                this.$router.push('/all-requests');
            } else {
                alert(`Error: ${data.message}`);
            }
        },
    },
}