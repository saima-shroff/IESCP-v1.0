from flask import jsonify, request
from flask_restful import Resource, Api, reqparse, marshal_with, fields, marshal
from flask_security import auth_required, roles_required, current_user
from .models import Campaigns, User, AdRequest, db
from datetime import datetime

api = Api(prefix='/api')

def date_type(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d')

parser = reqparse.RequestParser()
parser.add_argument('name', type=str, help='name of the campaign, must be a string', required=True)
parser.add_argument('description', type=str, help='brief description of the campaign. Should be a string',required=True)
parser.add_argument('start_date', type=date_type, help='date of commencement. Enter in YYYY-MM-DD format',required=True)
parser.add_argument('end_date', type=date_type, help='date of ending. Enter in YYYY-MM-DD format',required=True)
parser.add_argument('budget', type=int, help='budget for the campaign, must be an integer',required=True)
parser.add_argument('niche', type=str , help='category the campaign belongs to, must be a string',required=True)
parser.add_argument('is_public', type=bool , help='whether the campaign is available for public viewing')
parser.add_argument('goals', type=str , help='goals for  the campaign, must be a string',required=True)

campaign_fields = {
    "campaign_id":fields.Integer,
    "name" : fields.String,
    "description" : fields.String,
    "start_date": fields.DateTime,
    "end_date":fields.DateTime,
    "budget":fields.Integer,
    "niche":fields.String,
    "is_public":fields.Boolean,
    "goals":fields.String
}

update_parser = reqparse.RequestParser()
update_parser.add_argument('start_date', type=date_type, help='date of commencement. Enter in YYYY-MM-DD format', required=True)
update_parser.add_argument('end_date', type=date_type, help='date of ending. Enter in YYYY-MM-DD format',required=True)
update_parser.add_argument('budget', type=int, help='budget for the campaign, must be an integer',required=True) 
update_parser.add_argument('goals', type=str , help='goals for  the campaign, must be a string',required=True)


class AllCampaigns(Resource):
    @marshal_with(campaign_fields)
    @auth_required('token')
    def get(self):
        all_campaigns = Campaigns.query.all()
        return all_campaigns

    @auth_required('token')
    @roles_required('sponsor')
    def post(self):
        args = parser.parse_args()
        campaign = Campaigns(name = args.get('name'), description = args.get('description'), start_date = args.get('start_date'),end_date=args.get('end_date'),budget=args.get('budget'),niche=args.get('niche'),goals=args.get('goals'),is_public=False, sponsor_id=current_user.id)
        db.session.add(campaign)
        db.session.commit()
        return {"message":"Campaign Created"}
    
class CampaignBySponsor(Resource):
    @marshal_with(campaign_fields)
    @auth_required('token')
    def get(self, sponsor_id):
        campaigns = Campaigns.query.filter_by(sponsor_id=sponsor_id).all()
        if not campaigns:
            return {"message":"No Campaigns Created"}
        return campaigns

class Campaign(Resource):
    @auth_required('token')
    def get(self, campaign_id):
        campaign=Campaigns.query.filter_by(campaign_id=campaign_id).first()
        if not campaign:
            return {"message":"campaign not found"},404
        return marshal(campaign,campaign_fields)

    @auth_required('token')
    @roles_required('sponsor')
    def put(self, campaign_id):
        campaign = Campaigns.query.filter_by(campaign_id=campaign_id).first()
        if not campaign:
            return {"message":"Campaign not Found"}, 404
        args = update_parser.parse_args()
        campaign.start_date = args.get('start_date')
        campaign.end_date = args.get('end_date')
        campaign.budget = args.get('budget')
        campaign.goals = args.get('goals')
        if not args.get('start_date'):
            return {"message":"Enter Start Date"}, 400
        elif not args.get('end_date'):
            return {"message":"Enter End Date"},400
        elif not args.get('budget'):
            return {"message":"Enter Budget"}, 400
        elif not args.get('goals'):
            return {"message":"Enter Goals"},400
        db.session.add(campaign)
        db.session.commit()
        return {"message":"Campaign edited successfully"}
    
    @auth_required('token')
    @roles_required('sponsor')
    def delete(self, campaign_id):
        campaign = Campaigns.query.filter_by(campaign_id=campaign_id).first()
        if not campaign:
            return jsonify({"message":"Campaign not found"}), 404
        ads = AdRequest.query.filter_by(campaign_id=campaign_id).all()
        if ads:
            for ad in ads:
                db.session.delete(ad)
        db.session.delete(campaign)
        db.session.commit()
        return jsonify({"message":"Deleted successfully"})
    
class CampaignVisibility(Resource):
    @auth_required('token')
    @roles_required('sponsor')
    def put(self, campaign_id):
        campaign = Campaigns.query.filter_by(campaign_id=campaign_id).first()
        if not campaign:
            return {"message":"Campaign not found"}
        campaign.is_public = True
        db.session.add(campaign)
        db.session.commit()
        return {"message":"Campaign Is Public"}

class SearchCampaign(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', type=str, required=False, location='args')
        parser.add_argument('niche', type=str, required=False, location='args')
        args = parser.parse_args()
        name = args.get('name', None)
        niche = args.get('niche', None)
        try:
            query = Campaigns.query.filter(Campaigns.is_public == True)  
            if name:  
                query = query.filter(Campaigns.name.ilike(f"%{name}%"))
            if niche: 
                query = query.filter(Campaigns.niche.ilike(f"%{niche}%"))
            campaigns = query.all()
            return marshal(campaigns, campaign_fields)
        except Exception as e:
            print(f"Error in CampaignSearch: {e}")
            return {"message": "Internal server error occurred", "error": str(e)}, 500



ad_parser = reqparse.RequestParser()
ad_parser.add_argument('campaign_id', type=int, required=True)
ad_parser.add_argument('influencer_id', type=int, required=True)
ad_parser.add_argument('requirements', type=str, required=True)
ad_parser.add_argument('payment_amount', type=int, required=True)

ad_fields={
    "ad_id":fields.Integer,
    "campaign_id":fields.Integer,
    "influencer_id":fields.Integer,
    "requirements":fields.String,
    "payment_amount":fields.String,
    "status":fields.String,
    "campaign": fields.Nested(campaign_fields)
}

update_ad_parser = reqparse.RequestParser()
update_ad_parser.add_argument('influencer_id', type=int, required=True)
update_ad_parser.add_argument('requirements', type=str, required=True)
update_ad_parser.add_argument('payment_amount', type=int, required=True)

class AllRequests(Resource):
    @marshal_with(ad_fields)
    @auth_required('token')
    def get(self):
        all_ads = AdRequest.query.all()
        return all_ads
    
    @auth_required('token')
    @roles_required('sponsor')
    def post(self):
        args = ad_parser.parse_args()
        ad = AdRequest(campaign_id=args.get('campaign_id'),influencer_id=args.get('influencer_id'),requirements=args.get('requirements'),payment_amount=args.get('payment_amount'))
        db.session.add(ad)
        db.session.commit()
        return {"message":"Ad request created successfully."}
    

class AdRequestmanagement(Resource):
    @auth_required('token')
    @roles_required('sponsor')
    def get(self, ad_id):
        ad = AdRequest.query.filter_by(ad_id = ad_id).first()
        return marshal(ad, ad_fields)
    
    @auth_required('token')
    @roles_required('sponsor')
    def put(self, ad_id):
        ad = AdRequest.query.filter_by(ad_id=ad_id).first()
        if not ad:
            return {"message":"Ad request not Found"}, 404
        args = update_ad_parser.parse_args()
        ad.influencer_id = args.get('influencer_id')
        ad.requirements = args.get('requirements')
        ad.payment_amount = args.get('payment_amount')
        if not args.get('influencer_id'):
            return {"message":"Choose Influencer"}, 400
        elif not args.get('requirements'):
            return {"message":"Specify Requirements"},400
        elif not args.get('payment_amount'):
            return {"message":"Enter Payment Amount"}, 400
        db.session.add(ad)
        db.session.commit()
        return {"message":"Ad request edited successfully"}
    
    @auth_required('token')
    @roles_required('sponsor')
    def delete(self, ad_id):
        ad = AdRequest.query.filter_by(ad_id=ad_id).first()
        if not ad:
            return jsonify({"message":"Ad Request not found"}), 404
        db.session.delete(ad)
        db.session.commit()
        return jsonify({"message":"Deleted successfully"})

class RequestbySponsor(Resource):
    @auth_required('token')
    @roles_required('sponsor')
    def get(self):
        sponsor_id = current_user.id
        campaign = Campaigns.query.filter_by( sponsor_id=sponsor_id).first()
        ads = AdRequest.query.filter_by(campaign_id = campaign.campaign_id).all()
        if not ads:
            return jsonify({"message":"No Requests Found"}),404
        return marshal(ads, ad_fields)

class AdRequests(Resource):
    @auth_required('token')
    @roles_required('influencer')
    def get(self, influencer_id):
        ads = AdRequest.query.filter_by(influencer_id=influencer_id).all()
        if not ads:
            return {"message":"No ads found"}, 404
        return marshal(ads,ad_fields)
    
class AdminStatistics(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self):
        active_users_count = User.query.filter_by(active=True).count()

        public_campaigns_count = Campaigns.query.filter_by(is_public=True).count()
        private_campaigns_count = Campaigns.query.filter_by(is_public=False).count()

        ad_requests = db.session.query(
            AdRequest.status, db.func.count(AdRequest.status)
        ).group_by(AdRequest.status).all()
        ad_requests_stats = {status: count for status, count in ad_requests}

        return {
            "active_users": active_users_count,
            "public_campaigns": public_campaigns_count,
            "private_campaigns": private_campaigns_count,
            "ad_requests": ad_requests_stats,
        }

class UpdateRequestStatus(Resource):
    @auth_required('token')
    @roles_required('influencer')
    def put(self, ad_id):
        data = request.json
        new_status = data.get("status")

        if new_status not in ["Accepted", "Rejected"]:
            return {"message": "Invalid status"}, 400

        ad_request = AdRequest.query.get_or_404(ad_id)
        ad_request.status = new_status
        db.session.commit()

        return {"message": f"Ad request status updated to {new_status}"}

class NegotiatePayment(Resource):
    @auth_required('token')
    @roles_required('influencer')
    def put(self, ad_id): 
        data = request.json
        new_payment_amount = data.get("payment_amount")

        if not new_payment_amount or int(new_payment_amount) <= 0:
            return {"message": "Invalid payment amount"}, 400

        ad_request = AdRequest.query.get_or_404(ad_id)
        ad_request.payment_amount = new_payment_amount
        ad_request.status = "Pending Negotiation"
        db.session.commit()

        return {"message": f"Payment amount updated to {new_payment_amount}"}, 200

api.add_resource(Campaign,'/campaign/<int:campaign_id>')
api.add_resource(AllCampaigns,'/campaign')
api.add_resource(AllRequests,'/ad')
api.add_resource(AdRequestmanagement,'/ad/<int:ad_id>')
api.add_resource(AdRequests,'/requests/<int:influencer_id>')
api.add_resource(AdminStatistics,'/admin-stats')
api.add_resource(CampaignBySponsor,'/sponsor-campaigns/<int:sponsor_id>')
api.add_resource(RequestbySponsor,'/sponsor-ads')
api.add_resource(CampaignVisibility, '/campaign/<int:campaign_id>/toggle-visibility')
api.add_resource(SearchCampaign, '/campaign-search')
api.add_resource(UpdateRequestStatus,'/ad-request/<int:ad_id>/status')
api.add_resource(NegotiatePayment,'/ad-request/<int:ad_id>/negotiate')