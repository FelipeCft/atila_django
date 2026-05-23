"""
URL configuration for atila project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

# urls de users 
from users import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # urls de users (legacy)
    path('api/users/', views.UserList.as_view()),
    path('api/users/<int:pk>/', views.UserDetail.as_view()),
    path('api/users/<int:pk>/toggle-active/', views.ToggleUserActiveView.as_view(), name='toggle-user-active'),

    # ==================== AUTHENTICATION ENDPOINTS ====================
    # Registro público (crea usuarios CLIENT)
    path('api/auth/register/', views.PublicRegisterView.as_view(), name='public-register'),
    
    # Registro admin (crea usuarios con cualquier rol, requiere autenticación ADMIN)
    path('api/auth/admin/register/', views.AdminRegisterView.as_view(), name='admin-register'),
    
    # Login (acepta username o email)
    path('api/auth/login/', views.LoginView.as_view(), name='login'),

    # Verify Email
    path('api/auth/verify-email/', views.VerifyEmailView.as_view(), name='verify-email'),

    # urls de servicios
    path('api/', include('servicios.api.urls')),
    path('api/insumos/', include('insumos.urls')),
    path('api/agenda/', include('agenda.api.urls')),
    path('api/ai/', include('ai_agent.urls')),
    path('api/configuracion/', include('configuracion.urls')),
]
