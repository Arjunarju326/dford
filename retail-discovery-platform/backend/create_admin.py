import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

def create_admin():
    username = 'admin'
    password = 'arjuoo'
    email = 'admin@d4d.com'
    
    try:
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,
                'is_superuser': True,
                'user_type': 'admin',
                'is_verified': True
            }
        )
        
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.user_type = 'admin'
        user.is_verified = True
        user.save()
        
        if created:
            print(f"Superuser '{username}' created successfully!")
        else:
            print(f"Superuser '{username}' password and role updated successfully!")
            
    except Exception as e:
        print("Error creating/updating superuser:", e)

if __name__ == '__main__':
    create_admin()
