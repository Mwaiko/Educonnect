import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatMessage


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_id = self.scope['url_route']['kwargs']['group_id']
        self.room_group_name = f'chat_{self.group_id}'
        user = self.scope.get('user')

        if not user or not user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        user = self.scope['user']

        if message_type == 'chat.message':
            content = data.get('content', '').strip()
            if not content:
                return

            message = await self.save_message(user, self.group_id, content)

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_event',
                    'message_id': str(message.id),
                    'sender_id': str(user.id),
                    'sender_username': getattr(user, 'username', user.email),
                    'content': content,
                    'sent_at': message.sent_at.isoformat(),
                }
            )

        elif message_type == 'chat.typing':
            is_typing = data.get('is_typing', False)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_typing_event',
                    'user_id': str(user.id),
                    'username': getattr(user, 'username', user.email),
                    'is_typing': is_typing,
                }
            )

    async def chat_message_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat.message',
            'message_id': event['message_id'],
            'sender': {
                'id': event['sender_id'],
                'username': event['sender_username'],
            },
            'content': event['content'],
            'sent_at': event['sent_at'],
        }))

    async def chat_typing_event(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat.typing',
            'user': {
                'id': event['user_id'],
                'username': event['username'],
            },
            'is_typing': event['is_typing'],
        }))

    @database_sync_to_async
    def save_message(self, user, group_id, content):
        return ChatMessage.objects.create(
            group_id=group_id,
            sender=user,
            content=content
        )