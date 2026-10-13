from flask import current_app as app , jsonify, request, render_template, send_file
from .models import User, Role, RolesUsers, Sponsors, Influencers, db
from sqlalchemy.exc import IntegrityError
from flask_security import auth_required, roles_required
from .sec import datastore
from werkzeug.security import check_password_hash, generate_password_hash
from flask_restful import marshal, fields, reqparse
from tasks import create_csv
from celery.result import AsyncResult

@app.get('/')
def home():
    return render_template('index.html')

@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Hello admin"

@app.get('/activate/spsr/<int:spsr_id>')
@auth_required("token")
@roles_required("admin")
def activate_sponsor(spsr_id):
    sponsor = User.query.get(spsr_id)
    if not sponsor or "sponsor" not in sponsor.roles:
        return jsonify({"message":"Sponsor not found"}), 404
    sponsor.active = True
    db.session.commit()
    return jsonify({"message":"User Activated"})

@app.post('/user_login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message":"email not provided"}), 400
    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"message":"user not found"}), 404
    if user.roles[0] == 'sponsor':
        if user.active == False:
            return jsonify({"message":"User not approved"}),400
    if check_password_hash(user.password, data.get('password')):
        return jsonify({"token": user.get_auth_token(),"email":user.email,"role":user.roles[0].name, "id":user.id})
    else:
        return jsonify({"message":"Incorrect Password"}), 400
    
roles_fields = {
    "id":fields.Integer,
    "name":fields.String,
    "description":fields.String,
}

user_fields = {
    "id": fields.Integer,
    "email": fields.String,
    "active":fields.Boolean,
    "is_flagged":fields.Boolean,
    "roles":fields.Nested(roles_fields),
}

@app.get('/users')
@auth_required('token')
@roles_required('admin')
def all_users():
    users = User.query.all()
    if len(users)==0:
        return jsonify({"message":"No User Found"}),404
    return marshal(users, user_fields)

reg_parser = reqparse.RequestParser()
reg_parser.add_argument('email', type=str, required=True)
reg_parser.add_argument('password', type=str,required=True)
reg_parser.add_argument('role', type=str, required=True)
reg_parser.add_argument('company_name', type=str, required=True)
reg_parser.add_argument('industry', type=str, required=True)
reg_parser.add_argument('name', type=str, required=True)
reg_parser.add_argument('social_handle', type=str, required=True)
reg_parser.add_argument('niche', type=str, required=True)
reg_parser.add_argument('reach', type=int, required=True)

@app.post('/register')
def register_user():
    args = reg_parser.parse_args()
    if datastore.find_user(email=args.get('email')):
        return jsonify({"message": "User already exists"}), 400
    email = args.get('email')
    password = args.get('password')
    role = args.get('role')
    if not email or not password or not role:
        return jsonify({"message": "Email, password, and role are required"}), 400
    try:
        new_user = datastore.create_user(email=email,password=generate_password_hash(password),roles=[role],active=(role == 'influencer'))
        if role == 'sponsor':
            company_name = args.get('company_name')
            industry = args.get('industry')
            if not company_name or not industry:
                return jsonify({'message':"Enter sponsor details"})
            db.session.add(new_user)
            db.session.commit()
            sponsor = Sponsors(user_id=new_user.id, company_name=company_name, industry=industry)
            db.session.add(sponsor)
            db.session.commit()
        elif role == 'influencer':
            name = args.get('name')
            social_handle = args.get('social_handle')
            niche = args.get('niche')
            reach = args.get('reach')
            if not name or not social_handle or not niche or reach is None:
                return jsonify({"message":"Enter influencer Details"})
            if reach < 0:
                    return jsonify({"message":"Enter valid Reach"})
            db.session.add(new_user)
            db.session.commit()
            influencer = Influencers(user_id=new_user.id,name=name,social_handle=social_handle,niche=niche,reach=reach)
            db.session.add(influencer)
            db.session.commit()
        db.session.commit()
        if role == 'sponsor':
            return jsonify({"message": "Registration request sent to admin. Application can be accessed once approved."})
        else:
            return jsonify({"message": "Registered successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@app.put('/flag/sponsor/<int:user_id>')
@auth_required('token')
@roles_required('admin')
def flag_sponsor(user_id):
    user = User.query.filter_by(id = user_id).first()
    user.is_flagged = True
    user.active = False
    db.session.add(user)
    db.session.commit()
    return jsonify({"message":"User flagged"})

@app.put('/flag/influencer/<int:user_id>')
@auth_required('token')
@roles_required('admin')
def flag_influencer(user_id):
    user = User.query.filter_by(id = user_id).first()
    user.is_flagged = True
    user.active = False
    db.session.add(user)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message":"User Flagged"})

@app.get('/flagged-entities')
@auth_required('token')
@roles_required('admin')
def get_flagged_users():
    flagged_users = User.query.filter(User.is_flagged == True).all()
    if flagged_users:
        return marshal(flagged_users, user_fields)
    else:
        return jsonify({"message":"No flagged users"})

influencer_fields={
    'influencer_id':fields.Integer,
    'user_id':fields.Integer,
    'name':fields.String,
    'social_handle':fields.String,
    'niche':fields.String,
    'reach':fields.Integer
}

inf_parser=reqparse.RequestParser()
inf_parser.add_argument('name',type=str,required=True)
inf_parser.add_argument('social_handle',type=str,required=True)
inf_parser.add_argument('reach',type=int,required=True)
inf_parser.add_argument('niche',type=str,required=True)

@app.get('/influencers')
@auth_required('token')
@roles_required('sponsor')
def all_influencers():
    influencers = User.query.join(RolesUsers).join(Role).filter(Role.name=='influencer').all()
    if len(influencers)==0:
        return jsonify({"message":"No Influencer Found"}), 404
    return marshal(influencers, influencer_fields)

@app.get('/influencer')
@auth_required('token')
def get_influencers():
    name = request.args.get('name', '')
    niche = request.args.get('niche', '')
    min_followers = request.args.get('min_followers', type=int, default=0)

    query = Influencers.query
    if name:
        query = query.filter(Influencers.name.ilike(f"%{name}%")) 
    if niche:
        query = query.filter(Influencers.niche.ilike(f"%{niche}%")) 
    if min_followers > 0:
        query = query.filter(Influencers.reach >= min_followers) 

    influencers = query.all()
    return marshal(influencers, influencer_fields)


@auth_required('token')
@app.get('/influencer/<int:user_id>')
def get_influencer(user_id):
    influencer = Influencers.query.filter_by(user_id=user_id).first()
    if not influencer:
        return {"message":"influencer not found"}, 404
    else:
        return marshal(influencer, influencer_fields)

@auth_required('token')
@roles_required('influencer')
@app.put('/influencer/<int:user_id>')
def update_profile(user_id):
    influencer = Influencers.query.filter_by(user_id=user_id).first()
    if not influencer:
        return {"message":"influencer not found"}, 400
    args = inf_parser.parse_args()
    if not args.get('name'):
        return {"message":"Enter Name"}
    elif not args.get('reach'):
        return {"message":"Enter Reach"}
    elif not args.get('social_handle'):
        return {"message":"Enter social_handle"}
    elif not args.get('niche'):
        return {"message":"Enter niche"}
    influencer.name= args.get('name')
    influencer.social_handle = args.get('social_handle')
    influencer.reach = args.get('reach')
    influencer.niche = args.get('niche')
    db.session.add(influencer)
    db.session.commit()
    return {"message":"Profile updated successfully!"}

@auth_required('token')
@roles_required('sponsor')
@app.get('/influencer')
def influencers_by_niche():
    niche = request.args.get('niche')
    influencers = Influencers.query.filter_by(niche=niche).all()
    return marshal(influencers, influencer_fields)

@app.get('/start-export')
def start_export():
    task = create_csv.delay()
    return jsonify({'task-id':task.id})

@app.get('/task-status/<task_id>')
def task_status(task_id):
    result = AsyncResult(task_id)
    return jsonify({
        "task_id": task_id,
        "status": result.state, 
        "result": result.result if result.state == "SUCCESS" else None, 
    })

@app.get('/download-csv/<task_id>')
def get_csv(task_id):
    result = AsyncResult(task_id)
    if result.ready():
        return send_file('./user-downloads/campaigns.csv')
    else:
        return "task not ready", 405