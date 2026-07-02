# views_auth.py
from django.conf import settings
from django.shortcuts import redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from google_auth_oauthlib.flow import Flow

# Adjust this import based on your exact app name (e.g., 'users.models')
from apps.users.models import GoogleOAuthToken

SCOPES = ['https://www.googleapis.com/auth/meetings.space.created']

class GoogleLoginView(APIView):
    # Restrict this so only your superuser can trigger the flow
    permission_classes = [IsAdminUser] 

    def get(self, request):
        # Notice we use .from_client_config() and pass your settings dictionary
        flow = Flow.from_client_config(
            settings.GOOGLE_MEET_CONFIG,
            scopes=SCOPES,
            redirect_uri='http://localhost:8000/api/auth/google/callback'
        )
        
        # prompt='consent' forces Google to issue a refresh token every time
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            prompt='consent',
            include_granted_scopes='true'
        )
        
        # Store the state in the session to verify it later in the callback
        request.session['google_oauth_state'] = state
        
        return redirect(authorization_url)

class GoogleCallbackView(APIView):
    permission_classes = [IsAdminUser] 

    def get(self, request):
        state = request.session.get('google_oauth_state')
        
        flow = Flow.from_client_config(
            settings.GOOGLE_OAUTH_CLIENT_CONFIG,
            scopes=SCOPES,
            state=state,
            redirect_uri='http://localhost:8000/api/auth/google/callback'
        )
        
        # Rebuild the full URL to pass into fetch_token
        authorization_response = request.build_absolute_uri()
        flow.fetch_token(authorization_response=authorization_response)
        
        credentials = flow.credentials

        # Save to the database, linked to the admin user who initiated this
        GoogleOAuthToken.objects.update_or_create(
            user=request.user,
            defaults={
                'access_token': credentials.token,
                'refresh_token': credentials.refresh_token,
            }
        )
        
        return Response({
            "status": "success",
            "message": "Google credentials saved successfully. EduConnect is ready to create Google Meets."
        })