import os
import django
import sys

# Add project root to path
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atila.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import Profile

email = os.getenv('DJANGO_SUPERUSER_EMAIL')
password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
username = os.getenv('DJANGO_SUPERUSER_USERNAME')

if not email or not password or not username:
    print("Error: DJANGO_SUPERUSER_EMAIL, DJANGO_SUPERUSER_PASSWORD, and DJANGO_SUPERUSER_USERNAME must be set in environment variables.")
    sys.exit(1)

try:
    if not User.objects.filter(username=username).exists():
        user = User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser {username} created")
    else:
        user = User.objects.get(username=username)
        user.set_password(password)
        user.email = email
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"User {username} updated to Superuser")

    # Handle Profile
    # Check if profile exists (signals might have created it)
    if hasattr(user, 'profile'):
        profile = user.profile
    else:
        profile = Profile.objects.create(user=user)

    profile.role = 'ADMIN'
    
    # Update user name
    user.first_name = 'Admin'
    user.last_name = 'Demo'
    user.save()

    profile.is_verified = True
    profile.save()
    print("Profile updated to ADMIN and Verified")

except Exception as e:
    print(f"Error: {e}")
