export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center mb-4">Your Campaigns</h1>

        <div class="row">
            <div class="col-md-4 mb-4" v-for="campaign in campaigns" :key="campaign.campaign_id">
                <div class="card shadow-sm position-relative">
                    <span class="badge bg-primary position-absolute top-0 end-0 m-2">{{ campaign.niche }}</span>
                    <span v-if="campaign.is_public" class="badge bg-success position-absolute top-0 start-0 m-2">
                        Public
                    </span>
                    <div class="card-body">
                        <br>
                        <h5 class="card-title">{{ campaign.name }}</h5>
                        <p class="card-text">{{ campaign.description }}</p>
                        <div class="d-flex flex-column">
                            <button class="btn btn-outline-primary btn-sm mb-2" @click="viewDetails(campaign.campaign_id)">
                                View Details
                            </button>

                            <button class="btn btn-outline-warning btn-sm mb-2" @click="editCampaign(campaign.campaign_id)">
                                Edit Campaign
                            </button>

                            <button class="btn btn-outline-danger btn-sm mb-2" @click="confirmDelete(campaign.campaign_id)">
                                Delete Campaign
                            </button>

                            <button v-if="!campaign.is_public" class="btn btn-outline-secondary btn-sm" @click="makePublic(campaign.campaign_id)">
                                Make Public
                            </button>
                            <button v-if="campaign.is_public" class="btn btn-outline-primary btn-sm mb-2" @click="requestAd(campaign.campaign_id)">
                                Request Ad
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mt-4">
            <router-link to="/create-campaign" class="btn btn-success">Add New Campaign</router-link>
        </div>

        <div class="text-center mt-4 d-flex justify-content-center align-items-center">
            <button class="btn btn-primary me-2" :disabled="exporting" @click="startExport" v-if=campaigns.length>
                {{ exporting ? "Exporting..." : "Export Campaigns as CSV" }}
            </button>
            <a v-if="exportReady" :href="downloadLink" class="btn btn-success" download="campaigns.csv">
                Download CSV
            </a>
        </div>
        <div v-if="exportMessage" class="text-center mt-2">
            <p>{{ exportMessage }}</p>
        </div>
    </div>
    `,
    data() {
        return {
            campaigns: [],
            sponsor_id: localStorage.getItem('user-id'),
            token: localStorage.getItem('auth-token'),
            exporting: false,
            exportReady: false,
            exportMessage: '',
            downloadLink: '', 
        };
    },
    async mounted() {
        await this.fetchCampaigns();
    },
    methods: {
        async fetchCampaigns() {
            const res = await fetch(`/api/sponsor-campaigns/${this.sponsor_id}`, {
                headers: { 'Authentication-Token': this.token },
            });
            const data = await res.json();
            if (res.ok) {
                this.campaigns = data;
            } else {
                alert(`Failed to fetch campaigns: ${data.message}`);
            }
        },

        async startExport() {
            this.exporting = true;
            this.exportMessage = 'Starting export job...';

            try {

                const res = await fetch('/start-export', {
                    headers: { 'Authentication-Token': this.token },
                });
                if (!res.ok) throw new Error('Failed to start export job.');
                const { 'task-id': taskId } = await res.json();
                this.downloadLink = `/download-csv/${taskId}`;

                let taskComplete = false;
                while (!taskComplete) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); 

                    const statusRes = await fetch(`/task-status/${taskId}`);
                    const statusData = await statusRes.json();

                    if (statusData.status === 'SUCCESS') {
                        taskComplete = true;
                        this.exportMessage = 'Export complete! You can now download the CSV.';
                        alert(this.exportMessage);
                        this.exportReady = true;
                    } else if (statusData.status === 'FAILURE') {
                        this.exportMessage = 'Export failed. Please try again.';
                        taskComplete = true;
                    }
                }
            } catch (error) {
                this.exportMessage = `Error: ${error.message}`;
            } finally {
                this.exporting = false;
            }
        },

        viewDetails(campaign_id) {
            this.$router.push(`/campaign/${campaign_id}`);
        },

        editCampaign(campaign_id) {
            this.$router.push(`/edit-campaign/${campaign_id}`);
        },

        confirmDelete(campaign_id) {
            if (confirm('Are you sure you want to delete this campaign?')) {
                this.deleteCampaign(campaign_id);
            }
        },

        async deleteCampaign(campaign_id) {
            const res = await fetch(`/api/campaign/${campaign_id}`, {
                method: 'DELETE',
                headers: { 'Authentication-Token': this.token },
            });
            if (res.ok) {
                alert('Campaign deleted successfully!');
                this.campaigns = this.campaigns.filter(campaign => campaign.campaign_id !== campaign_id);
            } else {
                alert('Failed to delete campaign.');
            }
        },

        async makePublic(campaign_id) {
            const res = await fetch(`/api/campaign/${campaign_id}/toggle-visibility`, {
                method: 'PUT',
                headers: { 'Authentication-Token': this.token },
            });
            if (res.ok) {
                alert('Campaign is now public!');
                await this.fetchCampaigns(); 
            } else {
                alert('Failed to update campaign visibility');
            }
        },
        async requestAd(campaign_id){
            this.$router.push(`/campaign/request-ad/${campaign_id}`);
        }
    },
};