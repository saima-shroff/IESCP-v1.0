export default {
    template: `
    <div class="container mt-5">
        <h2 class="text-center">Create Campaign</h2>
        <form class="p-4 shadow-sm bg-light">
            <div class="mb-3">
                <label for="name" class="form-label">Campaign Name</label>
                <input type="text" class="form-control" id="name" v-model="campaign.name" placeholder="Enter campaign name">
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" v-model="campaign.description" rows="3" placeholder="Enter campaign description"></textarea>
            </div>
            <div class="mb-3">
                <label for="start_date" class="form-label">Start Date</label>
                <input type="date" class="form-control" id="start_date" v-model="campaign.start_date">
            </div>
            <div class="mb-3">
                <label for="end_date" class="form-label">End Date</label>
                <input type="date" class="form-control" id="end_date" v-model="campaign.end_date">
            </div>
            <div class="mb-3">
                <label for="budget" class="form-label">Budget</label>
                <input type="number" class="form-control" id="budget" v-model="campaign.budget" placeholder="Enter budget">
            </div>
            <div class="mb-3">
                <label for="niche" class="form-label">Niche</label>
                <select class="form-select" id="niche" v-model="campaign.niche">
                    <option value="" disabled selected>Select a niche</option>
                    <option v-for="niche in niches" :key="niche" :value="niche">{{ niche }}</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="goals" class="form-label">Goals</label>
                <textarea class="form-control" id="goals" v-model="campaign.goals" rows="3" placeholder="Enter campaign goals"></textarea>
            </div>
            <button type="button" class="btn btn-primary" @click="createCampaign">Submit</button>
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
            niches: ["Technology", "Health", "Lifestyle", "Fashion", "Food", "Travel"],
            token: localStorage.getItem('auth-token'),
        };
    },
    methods: {
        async createCampaign() {
            const res = await fetch('/api/campaign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.token,
                },
                body: JSON.stringify(this.campaign),
            });
            const data = await res.json();
            if (res.ok) {
                alert('Campaign created successfully!');
                this.$router.push('/');
            } else {
                alert(`Error: ${data.message}`);
            }
        },
    },
};