import os
from celery import Celery
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project53.settings')

django.setup()

app = Celery('project53',
            broker='redis://redis:6379/0',
            backend='redis://redis:6379/0',
             include=['spotify.tasks'])

if __name__ == '__main__':
    app.start()