from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

class User(db.Model, UserMixin):
    id=db.Column(db.Integer,autoincrement=True,primary_key=True)
    email=db.Column(db.String, unique=True)
    password=db.Column(db.String(255))
    active=db.Column(db.Boolean())
    is_flagged=db.Column(db.Boolean(),default=False, nullable=False)
    fs_uniquifier = db.Column(db.String(255),unique=True,nullable=False)
    roles = db.relationship('Role', secondary='roles_users', backref=db.backref('users',lazy='dynamic'))
    ad = db.relationship('AdRequest', backref='ad')
    campaign = db.relationship('Campaigns', backref='campaign')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name=db.Column(db.String, unique=True)
    description = db.Column(db.String(255))

class RolesUsers(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class Sponsors(db.Model):
    sponsor_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    company_name=db.Column(db.String, nullable=False)
    industry=db.Column(db.String, nullable=False)

class Influencers(db.Model):
    influencer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name=db.Column(db.String, unique=False, nullable=False)
    social_handle= db.Column(db.String, unique=True, nullable=False)
    niche=db.Column(db.String, nullable=False)
    reach=db.Column(db.Integer, nullable=False)
    user = db.relationship(User, backref='user')

class Campaigns(db.Model):
    campaign_id = db.Column(db.Integer, unique=True, primary_key=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String, unique=False, nullable = False)
    description=db.Column(db.String(255))
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    is_public = db.Column(db.Boolean(), default=False, nullable=False)
    niche = db.Column(db.String(255), nullable=False)
    goals = db.Column(db.String(255))

class AdRequest(db.Model):
    ad_id = db.Column(db.Integer, primary_key=True)
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaigns.campaign_id'))
    campaign = db.relationship('Campaigns', backref = 'ad_request')
    requirements = db.Column(db.String, nullable=False)
    payment_amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String, default='Pending')