# Influencer Engagement and Sponsorship Campaign Platform

## Application Overview

A Flask web application for sponsors to manage campaigns and ad requests, influencers to discover campaigns and respond to requests, and administrators to manage users and view platform statistics. The frontend is served from `templates/index.html` and the API is implemented with Flask routes and Flask-RESTful resources.

## Features

- Sponsor and influencer registration, token-based login, and role-protected operations.
- Campaign creation, editing, visibility management, and public campaign search.
- Ad request creation and management, including influencer responses and payment negotiation.
- Administrator user activation, flagging, and platform statistics.
- CSV campaign exports and scheduled reminder/report email tasks using Celery and Redis.

## Initial Setup

Prerequisites: Python 3.10 or newer and Redis. Email tasks use an SMTP server at `localhost:1025`; run a local SMTP catcher such as Mailpit if you need to test them. The application currently uses a local SQLite database and development settings from `config.py`.

From the repository root, create and activate a virtual environment, then install the dependencies:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Start Redis in a separate terminal. Then create the database tables, roles, and initial administrator:

```powershell
python upload_initial_data.py
```

The setup script creates the administrator `admin@email.com` with password `Admin01`. This is a development credential; change it before using any deployment environment.

Start the Flask application:

```powershell
python main.py
```

Open <http://127.0.0.1:5000/>. The application runs with Flask debug mode enabled by its development configuration.

For background jobs and scheduled email tasks, run a Celery worker and beat scheduler in separate terminals:

```powershell
celery -A main.celery_app worker --pool=solo --loglevel=INFO
celery -A main.celery_app beat --loglevel=INFO
```

Redis must be available for these commands. CSV export uses the worker; reminder and monthly report emails also require an SMTP service on `localhost:1025`.

## API Documentation

The Flask-RESTful endpoints use the `/api` prefix. For endpoints marked **Token**, send the token returned by `POST /user_login` in the `Authentication-Token` request header. Role restrictions are noted per endpoint. The regular Flask routes do not use the `/api` prefix.

### Authentication and Users

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| POST | `/user_login` | Public | Log in with JSON `email` and `password`; returns a token, role, and user ID. |
| POST | `/register` | Public | Register a user. The request parser requires `email`, `password`, `role`, `company_name`, `industry`, `name`, `social_handle`, `niche`, and integer `reach`. |
| GET | `/users` | Token, admin | List users. |
| GET | `/admin` | Token, admin | Admin check endpoint. |
| GET | `/activate/spsr/{spsr_id}` | Token, admin | Activate a sponsor account. |
| PUT | `/flag/sponsor/{user_id}` | Token, admin | Flag and deactivate a sponsor. |
| PUT | `/flag/influencer/{user_id}` | Token, admin | Flag and deactivate an influencer. |
| GET | `/flagged-entities` | Token, admin | List flagged users. |


### Campaigns

All paths in this table are under `/api`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/campaign` | Token | List campaigns. |
| POST | `/campaign` | Token, sponsor | Create a campaign. Required JSON fields: `name`, `description`, `start_date`, `end_date` (`YYYY-MM-DD`), integer `budget`, `niche`, and `goals`. |
| GET | `/campaign/{campaign_id}` | Token | Get a campaign. |
| PUT | `/campaign/{campaign_id}` | Token, sponsor | Update `start_date`, `end_date`, integer `budget`, and `goals`. |
| DELETE | `/campaign/{campaign_id}` | Token, sponsor | Delete a campaign and its ad requests. |
| PUT | `/campaign/{campaign_id}/toggle-visibility` | Token, sponsor | Make a campaign public. |
| GET | `/campaign-search?name={name}&niche={niche}` | Public | Search public campaigns; either query parameter is optional. |
| GET | `/sponsor-campaigns/{sponsor_id}` | Token | List campaigns for a sponsor. |
| GET | `/admin-stats` | Token, admin | Return user, campaign, and ad-request counts. |

### Influencers and Ad Requests

The influencer routes below are regular Flask routes and do not use the `/api` prefix. Ad-request resource routes do use `/api`.

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/influencers` | Token, sponsor | List influencer accounts. |
| GET | `/influencer?name={name}&niche={niche}&min_followers={count}` | Token | Search influencers. Query parameters are optional. |
| GET | `/influencer/{user_id}` | Token | Get an influencer profile by user ID. |
| PUT | `/influencer/{user_id}` | Token, influencer | Update profile using `name`, `social_handle`, integer `reach`, and `niche`. |
| GET | `/api/ad` | Token | List ad requests. |
| POST | `/api/ad` | Token, sponsor | Create a request with integer `campaign_id`, integer `influencer_id`, `requirements`, and integer `payment_amount`. |
| GET | `/api/ad/{ad_id}` | Token, sponsor | Get an ad request. |
| PUT | `/api/ad/{ad_id}` | Token, sponsor | Update `influencer_id`, `requirements`, and `payment_amount`. |
| DELETE | `/api/ad/{ad_id}` | Token, sponsor | Delete an ad request. |
| GET | `/api/requests/{influencer_id}` | Token, influencer | List requests for an influencer. |
| GET | `/api/sponsor-ads` | Token, sponsor | List requests for the sponsor's first campaign. |
| PUT | `/api/ad-request/{ad_id}/status` | Token, influencer | Set JSON `status` to `Accepted` or `Rejected`. |
| PUT | `/api/ad-request/{ad_id}/negotiate` | Token, influencer | Set a positive JSON `payment_amount`; request status becomes `Pending Negotiation`. |

### Export and Background Tasks

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/start-export` | Public | Queue a campaign CSV export and return its task ID. |
| GET | `/task-status/{task_id}` | Public | Read the Celery task status and successful result. |
| GET | `/download-csv/{task_id}` | Public | Download the generated campaign CSV after the task completes. |
