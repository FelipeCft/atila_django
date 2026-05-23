from django.contrib import admin
from .models import ClinicInformation, ChatSession, ChatMessage

@admin.register(ClinicInformation)
class ClinicInformationAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_at')
    search_fields = ('key', 'content')

class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ('role', 'content', 'timestamp')

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ('session_id', 'created_at')
    inlines = [ChatMessageInline]
    search_fields = ('session_id',)

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('session', 'role', 'timestamp')
    list_filter = ('role',)
    search_fields = ('content',)
