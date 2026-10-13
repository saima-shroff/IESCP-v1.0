export default {
    template: `
    <div class="container mt-5">
        <h1 class="text-center mb-4">Register</h1>
        <form class="p-4 border rounded bg-light" @submit.prevent="createUser">
            <!-- Email Field -->
            <div class="mb-3">
                <label for="email" class="form-label">Email Address</label>
                <input type="email" class="form-control" id="email" v-model="user.email" placeholder="Enter your email" required>
                <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
            </div>

            <!-- Password Field -->
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" v-model="user.password" placeholder="Enter your password" required>
            </div>

            <!-- Role Selection -->
            <div class="mb-3">
                <label class="form-label">I am a/an:</label>
                <div>
                    <input 
                        class="form-check-input" 
                        type="radio" 
                        value="sponsor" 
                        id="sponsor" 
                        v-model="user.role" 
                        required>
                    <label class="form-check-label" for="sponsor">Sponsor</label>
                </div>
                <div>
                    <input 
                        class="form-check-input" 
                        type="radio" 
                        value="influencer" 
                        id="inf" 
                        v-model="user.role" 
                        required>
                    <label class="form-check-label" for="inf">Influencer</label>
                </div>
            </div>

            <!-- Sponsor Fields -->
            <div v-if="user.role === 'sponsor'" class="mt-3">
                <h5>Sponsor Details</h5>
                <div class="mb-3">
                    <label for="company_name" class="form-label">Company Name</label>
                    <input type="text" class="form-control" id="company_name" v-model="user.company_name" placeholder="Enter your company name" required>
                </div>
                <div class="mb-3">
                    <label for="industry" class="form-label">Industry</label>
                    <input type="text" class="form-control" id="industry" v-model="user.industry" placeholder="Enter your industry" required>
                </div>
            </div>

            <!-- Influencer Fields -->
            <div v-if="user.role === 'influencer'" class="mt-3">
                <h5>Influencer Details</h5>
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="name" v-model="user.name" placeholder="Enter your name" required>
                </div>
                <div class="mb-3">
                    <label for="social_handle" class="form-label">Social Handle</label>
                    <input type="text" class="form-control" id="social_handle" v-model="user.social_handle" placeholder="Enter your social media handle" required>
                </div>
                <div class="mb-3">
                    <label for="niche" class="form-label">Niche</label>
                    <select class="form-select" id="niche" v-model="user.niche" required>
                        <option value="" disabled>Select your niche</option>
                        <option value="technology">Technology</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="fashion">Fashion</option>
                        <option value="food">Food</option>
                        <option value="travel">Travel</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label for="reach" class="form-label">Reach</label>
                    <input type="number" class="form-control" id="reach" v-model="user.reach" placeholder="Enter your audience reach" min="0" required>
                </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn btn-primary w-100">Submit</button>
        </form>
    </div>
    `,
    data() {
        return {
            user: {
                email: null,
                password: null,
                role: null,
                company_name: null,  
                industry: null,      
                name: null,          
                social_handle: null, 
                niche: null,         
                reach: null          
            },
        };
    },
    methods: {
        async createUser() {
            const res = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.user),
            });
            console.log(this.user)
            const data = await res.json().catch((e) => {});
            if (res.ok) {
                alert(data.message);
                this.$router.push('/');
            } else {
                alert(data.message);
            }
        },
    },
};