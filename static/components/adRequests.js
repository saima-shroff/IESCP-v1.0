export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center">Your Ad Requests</h1>

        <div v-if="adRequests.length === 0" class="text-center text-muted">
            <p>No ad requests found.</p>
        </div>
        <div v-else class="row">
            <div class="col-md-4 mb-4" v-for="ad in adRequests" :key="ad.ad_id">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <span class="badge position-absolute top-0 end-0 m-2" :class="{'bg-danger': ad.status === 'Pending'||ad.status === 'Pending Negotiation','bg-success': ad.status === 'Accepted','bg-secondary': ad.status === 'Rejected',}">
                            {{ ad.status }}
                        </span>
                        <h5 class="card-title">{{ ad.campaign.name }}</h5>
                        <p class="card-text"><strong>Requirements:</strong> {{ ad.requirements }}</p>
                        <p class="card-text"><strong>Payment:</strong> {{ ad.payment_amount }}</p>

                        <div v-if="ad.status === 'Pending'">
                            <label for="newPayment" class="form-label"><strong>Negotiate Payment:</strong></label>
                            <input type="number" v-model="ad.newPayment" placeholder="Enter new payment" class="form-control mb-2"/>
                            <button class="btn btn-warning btn-sm mb-2" @click="negotiatePayment(ad.ad_id, ad.newPayment)">
                                Negotiate
                            </button>

                        <div v-if="ad.status === 'Pending' || ad.status === 'Pending Negotiation'" class="mb-2">
                            <button class="btn btn-success btn-sm mb-2" @click="updateStatus(ad.ad_id, 'Accepted')">Accept</button>
                            <button class="btn btn-danger btn-sm mb-2" @click="updateStatus(ad.ad_id, 'Rejected')">Reject</button>
                        </div>
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
            influencerId: localStorage.getItem("user-id"), 
            token: localStorage.getItem('auth-token'), 
        };
    },
    async mounted() {
        await this.fetchAdRequests();
    },
    methods: {
        async fetchAdRequests() {
            const res = await fetch(`/api/requests/${this.influencerId}`, {
                headers: { "Authentication-Token": this.token },
            });
            if (res.ok) {
                this.adRequests = await res.json();
                this.adRequests.forEach((ad) => (ad.newPayment = ad.payment_amount));
            } else {
                alert("Failed to fetch ad requests.");
            }
        },
        async updateStatus(adId, status) {
            const res = await fetch(`/api/ad-request/${adId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": this.token,
                },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                alert(`Ad request ${status.toLowerCase()} successfully.`);
                this.fetchAdRequests(); 
            } else {
                alert("Failed to update ad request status.");
            }
        },
        async negotiatePayment(adId, newPaymentAmount) {
            console.log("Ad ID:", adId); 
            console.log("New Payment Amount:", newPaymentAmount)
            const res = await fetch(`/api/ad-request/${adId}/negotiate`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authentication-Token": this.token,
                },
                body: JSON.stringify({ payment_amount: newPaymentAmount }),
            });
            if (res.ok) {
                alert("Negotiation request sent successfully.");
                this.fetchAdRequests(); 
            } else {
                alert("Failed to negotiate payment amount.");
            }
        },
    },
};