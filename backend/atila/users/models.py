from django.db import models
from django.conf import settings

# Create your models here.

class Profile(models.Model):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Administrador'
        STAFF = 'STAFF', 'Personal'
        CLIENT = 'CLIENT', 'Cliente'
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profile',
    )
    # full_name removed, accessing via user.get_full_name()
    position = models.CharField(max_length=100, null=True, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)
    is_verified = models.BooleanField(default=False)
    rut = models.CharField(max_length=12, null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    agenda_color = models.CharField(max_length=7, default='#3b82f6')

    @property
    def full_name(self):
        return f"{self.user.first_name} {self.user.last_name}".strip()

    def __str__(self):
        return f'{self.full_name} {self.role}   {self.position}'
