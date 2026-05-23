from django.db import models

class ClinicInformation(models.Model):
    key = models.CharField(max_length=50, unique=True, help_text="e.g., 'history', 'mission', 'contact_info'")
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __cl__(self):
        return self.key

    class Meta:
        verbose_name = "Información de la Clínica"
        verbose_name_plural = "Informaciones de la Clínica"

class ChatSession(models.Model):
    session_id = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    pending_appointment_data = models.JSONField(null=True, blank=True)
    
    def __str__(self):
        return f"Sesión {self.session_id}"

class ChatMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'Usuario'),
        ('assistant', 'Asistente'),
    ]
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField(null=True, blank=True)
    tool_call_id = models.CharField(max_length=255, null=True, blank=True)
    tool_calls = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
