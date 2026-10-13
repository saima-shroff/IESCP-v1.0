export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center mb-4">Users Management</h1>
        <div v-if="error" class="alert alert-danger text-center">
            {{ error }}
        </div>
        <div class="list-group">
            <div class="list-group-item d-flex justify-content-between align-items-center" v-for="(user, index) in allUsers" :key="user.id">
                <span :class="{'text-danger': user.is_flagged}">
                    <span v-if="user.is_flagged" class="me-2">🚩</span> 
                    {{ user.email }}
                </span>
                <div>
                    <button class="btn btn-primary btn-sm me-2" v-if="!user.active && !user.is_flagged" @click="approve(user.id, index)">Activate</button>
                    <button v-if="user.active && !user.is_flagged && !isAdmin(user)" class="btn btn-warning btn-sm" @click="flagUser(user, index)">
                        Flag
                    </button>
                </div>
            </div>
        </div>
    </div>`,

    data() {
        return {
            allUsers: [],
            token: localStorage.getItem("auth-token"),
            error: null,
        };
    },

    methods: {
        isAdmin(user) {
            return user.roles.some(role => role.name === "admin");
        },

        async approve(UserId, index) {
            const res = await fetch(`/activate/spsr/${UserId}`, {
                method: "GET",
                headers: { "Authentication-Token": this.token },
            });
            const data = await res.json().catch((e) => {});
            if (res.ok) {
                alert(data.message);
                this.allUsers[index].active = true;
            }
        },

        async flagUser(user, index) {
            const role = user.roles.find(role => role.name === "sponsor" || role.name === "influencer");
            if (!role) {
                alert("Unable to flag user. Role not found.");
                return;
            }

            const endpoint = role.name === "sponsor" ? "/flag/sponsor" : "/flag/influencer";
            const res = await fetch(`${endpoint}/${user.id}`, {
                method: "PUT",
                headers: { "Authentication-Token": this.token },
            });
            const data = await res.json().catch((e) => {});
            if (res.ok) {
                alert(data.message);
                this.allUsers[index].is_flagged = true;
                this.allUsers[index].active = false;
            }
        },
    },

    async mounted() {
        const res = await fetch("/users", {
            headers: {
                "Authentication-Token": this.token,
            },
        });
        const data = await res.json().catch((e) => {});
        if (res.ok) {
            this.allUsers = data;
        } else {
            this.error = `Error: ${res.status}`;
        }
    },
};