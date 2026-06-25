from rest_framework import serializers
from .models import Profile
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', required=False)
    email = serializers.EmailField(source='user.email', required=False, allow_blank=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    # full_name is now a property, read-only
    full_name = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)
    password = serializers.CharField(write_only=True, required=False) # Optional for updates
    especialidades = serializers.PrimaryKeyRelatedField(source='user.especialidades', many=True, read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user_id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_active', 'password', 'position', 'role', 'rut', 'phone_number', 'especialidades', 'agenda_color']

    def validate_rut(self, value):
        if value and value.strip():
            queryset = Profile.objects.filter(rut=value)
            if self.instance and self.instance.id:
                queryset = queryset.exclude(id=self.instance.id)
            if queryset.exists():
                raise serializers.ValidationError("Este RUT ya está registrado.")
        return value

    def validate_phone_number(self, value):
        if value and value.strip():
            queryset = Profile.objects.filter(phone_number=value)
            if self.instance and self.instance.id:
                queryset = queryset.exclude(id=self.instance.id)
            if queryset.exists():
                raise serializers.ValidationError("Este número de teléfono ya está registrado.")
        return value

    def validate_email(self, value):
        if value and value.strip():
            queryset = User.objects.filter(email=value)
            if self.instance and hasattr(self.instance, 'user') and self.instance.user and self.instance.user.id:
                queryset = queryset.exclude(id=self.instance.user.id)
            if queryset.exists():
                raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate(self, data):
        """Para roles ADMIN y STAFF, exigir nombre, apellido, cargo y email si se actualizan o si son proporcionados vacíos."""
        role = data.get('role', getattr(self.instance, 'role', None))
        
        if role in [Profile.Role.ADMIN, Profile.Role.STAFF]:
            user_data = data.get('user', {})
            
            # Obtener valores entrantes o actuales
            first_name = user_data.get('first_name', getattr(self.instance.user, 'first_name', '') if self.instance and hasattr(self.instance, 'user') else '')
            last_name = user_data.get('last_name', getattr(self.instance.user, 'last_name', '') if self.instance and hasattr(self.instance, 'user') else '')
            email = user_data.get('email', getattr(self.instance.user, 'email', '') if self.instance and hasattr(self.instance, 'user') else '')
            position = data.get('position', getattr(self.instance, 'position', '') if self.instance else '')

            if not first_name.strip():
                raise serializers.ValidationError({'first_name': 'El nombre es obligatorio para este rol.'})
            if not last_name.strip():
                raise serializers.ValidationError({'last_name': 'El apellido es obligatorio para este rol.'})
            if not position or not position.strip():
                raise serializers.ValidationError({'position': 'El cargo es obligatorio para este rol.'})
            if not email.strip():
                raise serializers.ValidationError({'email': 'El email es obligatorio para este rol.'})
                
        return data

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        
        # Por seguridad y simplicidad, forzamos el rol a CLIENT en esta vista
        validated_data['role'] = Profile.Role.CLIENT

        user = User.objects.create_user(**user_data, password=password)
        # El signal ya creó el profile, lo actualizamos con los campos restantes
        Profile.objects.filter(user=user).update(**validated_data)
        
        return Profile.objects.get(user=user)

    def update(self, instance, validated_data):
        # Extraer datos anidados del usuario
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', None)

        # Actualizar usuario relacionado
        user = instance.user
        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        if 'first_name' in user_data:
            user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            user.last_name = user_data['last_name']
        if password:
            user.set_password(password)
        user.save()

        # Actualizar campos directos del perfil usando el método padre
        return super().update(instance, validated_data)


# ==================== AUTHENTICATION SERIALIZERS ====================

class PublicRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para registro público de usuarios.
    Solo crea usuarios con rol CLIENT (no permite seleccionar rol).
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=4)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    rut = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Profile
        fields = ['email', 'password', 'first_name', 'last_name', 'rut', 'phone_number']

    def validate_email(self, value):
        """Verifica que el email no exista"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate_rut(self, value):
        """Verifica que el RUT no exista"""
        if value and value.strip() and Profile.objects.filter(rut=value).exists():
            raise serializers.ValidationError("Este RUT ya está registrado.")
        return value

    def validate_phone_number(self, value):
        """Verifica que el teléfono no exista"""
        if value and value.strip() and Profile.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Este número de teléfono ya está registrado.")
        return value

    def create(self, validated_data):
        """Crea un User y su Profile asociado con rol CLIENT"""
        # Extraer datos del usuario
        email = validated_data.pop('email')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name')
        last_name = validated_data.pop('last_name')
        rut = validated_data.pop('rut', '')
        phone_number = validated_data.pop('phone_number', '')
        
        # Crear el usuario de Django
        user = User.objects.create_user(
            username=email, # Usamos email como username
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Crear o actualizar el perfil con rol CLIENT (forzado)
        # El signal post_save ya crea el perfil, pero aseguramos
        profile, created = Profile.objects.update_or_create(
            user=user,
            defaults={
                'role': Profile.Role.CLIENT,
                'rut': rut,
                'phone_number': phone_number
            }
        )
        
        return profile


class AdminRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para que administradores creen usuarios con cualquier rol.
    Requiere autenticación y permisos de ADMIN.
    Para rol CLIENT: first_name, last_name, position y email son opcionales.
    Para otros roles: todos los campos son requeridos.
    """
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, required=True, min_length=4)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    position = serializers.CharField(required=False, allow_blank=True, default='')
    role = serializers.ChoiceField(choices=Profile.Role.choices, required=True)
    rut = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    agenda_color = serializers.CharField(required=False, allow_blank=True, default='#3b82f6')

    class Meta:
        model = Profile
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'position', 'role', 'rut', 'phone_number', 'agenda_color']

    def validate(self, data):
        """Para roles ADMIN y STAFF, exigir nombre, apellido, cargo y email"""
        role = data.get('role')
        if role in [Profile.Role.ADMIN, Profile.Role.STAFF]:
            if not data.get('first_name', '').strip():
                raise serializers.ValidationError({'first_name': 'El nombre es obligatorio para este rol.'})
            if not data.get('last_name', '').strip():
                raise serializers.ValidationError({'last_name': 'El apellido es obligatorio para este rol.'})
            if not data.get('position', '').strip():
                raise serializers.ValidationError({'position': 'El cargo es obligatorio para este rol.'})
            if not data.get('email', '').strip():
                raise serializers.ValidationError({'email': 'El email es obligatorio para este rol.'})
        return data

    def validate_username(self, value):
        """Verifica que el username no exista"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Este nombre de usuario ya está en uso.")
        return value

    def validate_email(self, value):
        """Verifica que el email no exista (solo si se proporcionó)"""
        if value and value.strip():
            if User.objects.filter(email=value).exists():
                raise serializers.ValidationError("Este email ya está registrado.")
        return value

    def validate_rut(self, value):
        """Verifica que el RUT no exista"""
        if value and value.strip() and Profile.objects.filter(rut=value).exists():
            raise serializers.ValidationError("Este RUT ya está registrado.")
        return value

    def validate_phone_number(self, value):
        """Verifica que el teléfono no exista"""
        if value and value.strip() and Profile.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("Este número de teléfono ya está registrado.")
        return value

    def create(self, validated_data):
        """Crea un User y su Profile asociado con el rol especificado"""
        # Extraer datos del usuario
        username = validated_data.pop('username')
        email = validated_data.pop('email', '')
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        role = validated_data.pop('role')
        
        # Crear el usuario de Django
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Crear o actualizar el perfil con el rol especificado
        profile, created = Profile.objects.update_or_create(
            user=user,
            defaults={
                'position': validated_data.get('position', ''),
                'role': role,  # Rol seleccionado por el admin
                'rut': validated_data.get('rut', ''),
                'phone_number': validated_data.get('phone_number', ''),
                'agenda_color': validated_data.get('agenda_color', '#3b82f6'),
                'is_verified': True  # Admin avala al usuario, no necesita verificar correo
            }
        )
        
        return profile


class LoginSerializer(serializers.Serializer):
    """
    Serializer para login que acepta username O email.
    """
    identifier = serializers.CharField(required=True, help_text="Username o Email")
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        """Valida las credenciales y retorna el usuario autenticado"""
        identifier = data.get('identifier')
        password = data.get('password')

        if not identifier or not password:
            raise serializers.ValidationError("Debe proporcionar username/email y password.")

        # Intentar autenticar primero como username
        user = authenticate(username=identifier, password=password)
        
        # Si falla, intentar buscar por email y autenticar
        if not user:
            try:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")

        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está desactivada.")

        # Agregar el usuario al contexto validado
        data['user'] = user
        return data

    def to_representation(self, instance):
        """Retorna los datos del usuario autenticado"""
        user = instance['user']
        try:
            profile = user.profile
            return {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': profile.full_name, # Accessing via property
                'position': profile.position,
                'role': profile.role,
            }
        except Profile.DoesNotExist:
            raise serializers.ValidationError("Este usuario no tiene un perfil asociado.")
