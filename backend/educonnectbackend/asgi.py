"""
ASGI config for educonnectbackend project.
Configured for Django Channels to support both HTTP and WebSocket protocols.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'educonnectbackend.settings')
django.setup()

from .routing import application