import os
from django.db import models
from django.contrib.auth import get_user_model

USER_MODEL = get_user_model()


class CommercialYear(models.Model):
    title = models.CharField(max_length=15)


class Branch(models.Model):
    title = models.CharField(max_length=60)
    address = models.CharField(max_length=60)
    phoneNumber = models.CharField(max_length=60, null=True, blank=True)
    deleted = models.BooleanField(default=False)


class Agents(models.Model):
    title = models.CharField(max_length=100)
    group = models.CharField(max_length=50, default="agent") # agent , employee  , remittance
    address = models.TextField(null=True, blank=True)
    phoneNumber = models.CharField(max_length=20, null=True, blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING, null=True, blank=True)
    userAuth = models.ForeignKey(USER_MODEL,
                                 related_name='userAdded',
                                 on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)


class InitAgentsBalance(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    initDenar = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    initDollar = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    initYuan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
   

class Fatora(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    dateAt = models.DateTimeField(auto_now_add=True)
    #  1= ordering , 2= buying , 3= shipping ,4 =delivering , 5= done
    buyingAt = models.DateTimeField(null=True, blank=True)
    buyingBy = models.ForeignKey(USER_MODEL,  related_name='SentToBuy',
                                 on_delete=models.DO_NOTHING, null=True, blank=True)

    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)


class FatoraItems(models.Model):
    fatora = models.ForeignKey(Fatora, on_delete=models.DO_NOTHING)
    description = models.TextField()
    status = models.IntegerField(default=1)
    InternalDelivery = models.CharField(max_length=100, null=True, blank=True)
    quantity = models.FloatField(default=0)
    unitPrice = models.FloatField(default=0)
    itemTitle = models.CharField(max_length=200, null=True, blank=True)
    externalURL = models.URLField(null=True, blank=True)
    pictureURL = models.URLField(null=True, blank=True)
    weight = models.FloatField(default=0)
    shippingType = models.CharField(max_length=20, null=True, blank=True)
    deleted = models.BooleanField(default=False)
