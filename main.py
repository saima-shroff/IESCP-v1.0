from flask import Flask
from flask_security import Security
from application.models import db
from config import DevelopmentConfig
from application.resources import api
from application.sec import datastore
from worker import celery_init_app
import flask_excel as excel
from tasks import daily_reminder, monthly_report
from celery.schedules import crontab

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    app.security = Security(app, datastore)
    with app.app_context():
        import application.views
    return app
app = create_app()
celery_app = celery_init_app(app)
excel.init_excel(app)

@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender,**kwargs):
    sender.add_periodic_task(crontab(hour=18,minute=0),daily_reminder.s(),name="influencer_reminder")
    sender.add_periodic_task(crontab(hour=0,minute=0, day_of_month=1),monthly_report.s(),name="monthly_reports")


if __name__ == '__main__':
    app.run(debug=True)