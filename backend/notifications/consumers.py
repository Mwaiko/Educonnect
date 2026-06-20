import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')

        if not user or not user.is_authenticated:
            await self.close()
            return

        self.room_group_name = f'notifications_{user.id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Notifications are server-pushed only; client doesn't send messages
        pass

    async def notification_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'notification.new',
            'notification_id': event['notification_id'],
            'notification_type': event['notification_type'],
            'payload': event['payload'],
            'created_at': event['created_at'],
        }))