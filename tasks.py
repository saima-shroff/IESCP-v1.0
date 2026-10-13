from celery import shared_task
import flask_excel as excel
from application.models import Campaigns, AdRequest, Influencers, Sponsors, User
import os
from mail_service import send_email
from markupsafe import Markup
from sqlalchemy import func

@shared_task(ignore_result=False)
def create_csv():
    os.makedirs('./user-downloads', exist_ok=True)
    campaigns = Campaigns.query.with_entities(Campaigns.name,Campaigns.description,Campaigns.start_date,Campaigns.end_date,Campaigns.budget,Campaigns.is_public,Campaigns.niche,Campaigns.goals).all()
    if not campaigns:
        raise ValueError("No data found to generate CSV.")
    csv_out = excel.make_response_from_query_sets(campaigns,['name', 'description', 'start_date', 'end_date', 'budget', 'is_public', 'niche', 'goals'],'csv')
    if csv_out is None:
        raise ValueError("Failed to generate CSV output.")
    with open('./user-downloads/campaigns.csv', 'wb') as file:
        file.write(csv_out.data)
    return 'campaigns.csv'

@shared_task(ignore_result=True)
def daily_reminder():
    pending_requests = AdRequest.query.filter(AdRequest.status == 'Pending').all()
    for request in pending_requests:
        influencer = Influencers.query.filter_by(user_id = request.influencer_id).first()
        to = influencer.user.email
        subject = "Reminder: You have pending ad requests!"
        content = f"<p>Hi {influencer.name},</p><p>You have pending ad requests waiting for your review. Please log in to your account to review and respond.</p><a href='http://127.0.0.1:5000/#/'>Go to App</a>"
        send_email(to,subject,content)
    return "OK"

@shared_task(ignore_result=False)
def monthly_report():
    recipients = Sponsors.query.all()
    for recipient in recipients:
        report_html = f"<h1>Monthly Activity Report for Sponsor #{recipient.sponsor_id}</h1>"
        campaigns = Campaigns.query.filter_by(sponsor_id=recipient.user_id).all()
        if not campaigns:
            report_html = "<h2>You have no active campaigns at the moment!</h2><p>Login on the app and create a campaign now!</p><p><a href='http://127.0.0.1:5000/'>Go to the app</a></p>"
        for campaign in campaigns:
            accepted_requests = (AdRequest.query.filter_by(campaign_id=campaign.campaign_id, status="Accepted").with_entities(func.sum(AdRequest.payment_amount).label("total_spent")).first())
            budget_spent = accepted_requests.total_spent or 0
            budget_remaining = campaign.budget - budget_spent
            num_accepted_requests = (AdRequest.query.filter_by(campaign_id=campaign.campaign_id, status="Accepted").count())
            ad_requests = AdRequest.query.filter_by(campaign_id=campaign.campaign_id).all()
            report_html += f"""
            <h2>Campaign: {campaign.name}</h2>
            <ul>
                <li><strong>Description:</strong> {campaign.description}</li>
                <li><strong>Total Budget:</strong> {campaign.budget}</li>
                <li><strong>Budget Spent:</strong> {budget_spent}</li>
                <li><strong>Budget Remaining:</strong> {budget_remaining}</li>
                <li><strong>Goals:</strong> {campaign.goals}</li>
                <li><strong>Start Date:</strong> {campaign.start_date}</li>
                <li><strong>End Date:</strong> {campaign.end_date}</li>
                <li><strong>Niche:</strong> {campaign.niche}</li>
                <li><strong>Number of Accepted Ad Requests:</strong> {num_accepted_requests}</li>
            </ul>
            """
            report_html += f"<h3>Ad Requests for {campaign.name}</h3>"
            if ad_requests:
                report_html += "<ul>"
                for ad_request in ad_requests:
                    report_html += f"""
                    <li>
                        <p><strong>Ad Request ID:</strong> {ad_request.ad_id}</p>
                        <p><strong>Details:</strong> {ad_request.requirements}</p>
                        <p><strong>Status:</strong> {ad_request.status}</p>
                        <p><strong>Payment Amount:</strong> {ad_request.payment_amount}</p>
                    </li>
                    """
                report_html += "</ul>"
            else:
                report_html += "<p>No ad requests found for this campaign.</p>"
            report_html += "<hr>"
        email = User.query.filter_by(id = recipient.user_id).with_entities(User.email).first()
        send_email(email[0], "Your Monthly Stats!", Markup(report_html))
    return "OK"