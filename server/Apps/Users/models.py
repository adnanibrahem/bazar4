from django.db import models
from django.contrib.auth import get_user_model
from Backend.lists import PRIVILEGE
USER_MODEL = get_user_model()


class Branch(models.Model):
    title = models.CharField(max_length=60)
    address = models.CharField(max_length=60)
    phoneNumber = models.TextField(null=True, blank=True)
    deleted = models.BooleanField(default=False)


class Users(models.Model):
    auth = models.OneToOneField(USER_MODEL, on_delete=models.CASCADE,
                                related_name='for_auth_id', default='', blank=True)
    phoneNumber = models.TextField(max_length=30, default='', blank=True)
    img = models.ImageField(upload_to='users', null=True, blank=True)
    privilege = models.CharField(max_length=25, choices=PRIVILEGE,
                                 default='store')
    agent = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING,
                               null=True, blank=True)
    # 1 - all permission , 2 - add only , 3 - read only
    permission = models.IntegerField(default=1, blank=True, null=True)


class CommercialYear(models.Model):
    title = models.CharField(max_length=15)
