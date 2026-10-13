export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center mb-4">Admin Dashboard</h1>

        <div v-if="error" class="alert alert-danger text-center">
            Error: {{ error }}
        </div>

        <div v-if="stats">
            <!-- Overall Statistics Section -->
            <div class="row text-center">
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Active Users</h5>
                            <p class="display-4 text-primary">{{ stats.active_users }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Public Campaigns</h5>
                            <p class="display-4 text-success">{{ stats.public_campaigns }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">Private Campaigns</h5>
                            <p class="display-4 text-warning">{{ stats.private_campaigns }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Flagged Entities Section -->
            <div class="mt-5">
                <h2 class="text-center mb-3">Flagged Entities</h2>
                <div class="row">
                    <!-- Flagged Sponsors -->
                    <div class="col-md-6">
                        <h4 class="text-center text-danger">Flagged Sponsors</h4>
                        <ul class="list-group">
                            <li 
                                class="list-group-item d-flex justify-content-between align-items-center" 
                                v-for="sponsor in flaggedEntities.sponsors" 
                                :key="sponsor.id"
                            >
                                <span>
                                    {{ sponsor.email }} ({{ getRoleName(sponsor) }})
                                </span>
                            </li>
                        </ul>
                    </div>

                    <!-- Flagged Influencers -->
                    <div class="col-md-6">
                        <h4 class="text-center text-danger">Flagged Influencers</h4>
                        <ul class="list-group">
                            <li 
                                class="list-group-item d-flex justify-content-between align-items-center" 
                                v-for="influencer in flaggedEntities.influencers" 
                                :key="influencer.id"
                            >
                                <span>
                                    {{ influencer.email }} ({{ getRoleName(influencer) }})
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Campaigns and Ad Requests Sections -->
            <div class="mt-5">
                <h2 class="text-center mb-3">Campaigns by Visibility</h2>
                <div class="row">
                    <!-- Public Campaigns -->
                    <div class="col-md-6">
                        <h4 class="text-center text-success">Public Campaigns</h4>
                        <ul class="list-group">
                            <li class="list-group-item" v-for="campaign in campaigns.public" :key="campaign.campaign_id">
                                <h5>{{ campaign.name }}</h5>
                                <p>{{ campaign.description }}</p>
                            </li>
                        </ul>
                    </div>
                    <!-- Private Campaigns -->
                    <div class="col-md-6">
                        <h4 class="text-center text-warning">Private Campaigns</h4>
                        <ul class="list-group">
                            <li class="list-group-item" v-for="campaign in campaigns.private" :key="campaign.campaign_id">
                                <h5>{{ campaign.name }}</h5>
                                <p>{{ campaign.description }}</p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

    data() {
        return {
            stats: null,
            campaigns: {
                public: [],
                private: [],
            },
            adRequests: {
                pending: [],
                active: [],
            },
            flaggedEntities: {
                sponsors: [],
                influencers: [],
            },
            error: null,
            token: localStorage.getItem('auth-token'),
        };
    },

    methods: {
        getRoleName(user) {
            return user.roles.map(role => role.name).join(", ");
        },
        async fetchFlaggedEntities() {
            try {
                const flaggedRes = await fetch("/flagged-entities", {
                    headers: { "Authentication-Token": this.token },
                });
                if (!flaggedRes.ok) {
                    this.error = `Failed to fetch flagged entities: ${flaggedRes.status}`;
                    return;
                }
                const flaggedData = await flaggedRes.json();
                if (flaggedData.message === "No flagged users") {
                    this.flaggedEntities.sponsors = [];
                    this.flaggedEntities.influencers = [];
                } else {
                    this.flaggedEntities.sponsors = flaggedData.filter(user =>
                        user.roles.some(role => role.name === "sponsor")
                    );
                    this.flaggedEntities.influencers = flaggedData.filter(user =>
                        user.roles.some(role => role.name === "influencer")
                    );
                }
            } catch (error) {
                console.error("Error fetching flagged entities:", error);
                this.error = "An unexpected error occurred while fetching flagged entities.";
            }
        },
    },

    async mounted() {
        try {
            const statsRes = await fetch("/api/admin-stats", {
                headers: {
                    "Authentication-Token": this.token,
                },
            });
            const statsData = await statsRes.json();
            if (statsRes.ok) {
                this.stats = statsData;
            } else {
                this.error = `Failed to fetch statistics: ${statsRes.status}`;
            }
            await this.fetchFlaggedEntities();
            const campaignsRes = await fetch("/api/campaign", {
                headers: {
                    "Authentication-Token": this.token,
                },
            });
            const campaignsData = await campaignsRes.json();
            if (campaignsRes.ok) {
                this.campaigns.public = campaignsData.filter((c) => c.is_public);
                this.campaigns.private = campaignsData.filter((c) => !c.is_public);
            } else {
                this.error = `Failed to fetch campaigns: ${campaignsRes.status}`;
            }
            const adRequestsRes = await fetch("/api/ad", {
                headers: {
                    "Authentication-Token": this.token,
                },
            });
            const adRequestsData = await adRequestsRes.json();
            if (adRequestsRes.ok) {
                this.adRequests.pending = adRequestsData.filter((r) => r.status === "Pending");
                this.adRequests.active = adRequestsData.filter((r) => r.status === "Active");
            } else {
                this.error = `Failed to fetch ad requests: ${adRequestsRes.status}`;
            }
        } catch (e) {
            this.error = "An unexpected error occurred.";
        }
    },
};