export default {
    template: `
    <div class="container mt-5">
        <div v-if="error" class="alert alert-danger text-center">
            Error: {{ error }}
        </div>
        <div v-if="request" class="card shadow-sm">
            <div class="card-body">
                <div class="text-end">
                    <span 
                        class="badge position-absolute top-0 end-0 m-2"
                        :class="request.status === 'Pending' ? 'bg-danger' : 'bg-success'">
                        {{ request.status }}
                    </span>
                </div>
                <h3 class="card-title">{{ request.campaign.name }}</h3> <br>
                <p class="card-text">Influencer ID : {{ request.influencer_id }}</p>
                <p><strong>Requirements : </strong>{{request.requirements}}</p>
                <p><strong>Payment Amount : </strong> {{ request.payment_amount }}</p>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            request: null,
            error: null,
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
            this.error = `Error: ${res.status}`;
        }
    },
};