from main import app
from application.sec import datastore
from application.models import db
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name='admin',description='This is an admin')
    datastore.find_or_create_role(name='sponsor',description='This is a sponsor')
    datastore.find_or_create_role(name='influencer',description='This is an influencer')
    db.session.commit()
    if not datastore.find_user(email='admin@email.com'):
        datastore.create_user(email='admin@email.com', password=generate_password_hash('Admin01'), roles=['admin'])
    db.session.commit()