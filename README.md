# Euler ODE Copilot

This repository contains a Flask backend and frontend for Euler method ODE solving.

## Production deployment setup

### 1. Create a virtual environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies

```powershell
pip install -r requirements.txt
```

### 3. Run locally with Gunicorn

```powershell
gunicorn app:app
```

### 4. Deploy to a production host

Recommended steps:

- Push the repository to the host provider (Render, Heroku, Railway, DigitalOcean, etc.)
- Use the provided `Procfile` for Heroku-style deployments
- Ensure the host installs dependencies from `requirements.txt`
- Your Flask app now serves the frontend files and API from the same host
- Use HTTPS via host-managed TLS

### Host setup notes
- The app is full-stack in one repo now.
- The browser can load `index.html` and call the API without cross-origin issues.
- This is the best setup for deployment to a single free host.

### 5. Notes

- The app uses `Flask-Cors` to allow frontend requests.
- The built-in Flask development server is only for local testing.
- For production, the `Procfile` starts the app with `gunicorn app:app`.
