import os
from django.db import models
from django.contrib.auth import get_user_model
from Apps.Users.models import Branch, CommercialYear
 

USER_MODEL = get_user_model()


def get_upload_path(instance, filename):
    return os.path.join("postBooks", "%s" % instance.postBook.code + " %s" % instance.postBook.date.strftime("%Y-%m-%d"), filename)


class Agents(models.Model):
    title = models.CharField(max_length=100)
    group = models.CharField(max_length=15, default='customer')  # customer , employee
    address = models.TextField(null=True, blank=True)
    phoneNumber = models.CharField(max_length=20, null=True, blank=True)
    loginAuth = models.ForeignKey(USER_MODEL, related_name='usedForAgentLogin', on_delete=models.DO_NOTHING, null=True, blank=True)
    userAuth = models.ForeignKey(USER_MODEL,related_name='userAdded', on_delete=models.DO_NOTHING)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)


class InitAgentsBalance(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    denar = models.FloatField(default=0, )
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)


class Fatora(models.Model):
    agent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING)
    fatoraType = models.IntegerField(default=1)  # 1= purchas , 2 = sales
    discount = models.FloatField(default=0)
    totalPrice = models.FloatField()
    balanceDenar = models.FloatField(default=0)
    oldBalanceDenar = models.FloatField(default=0)
    paidAmount = models.FloatField(default=0)
    fatoraDate = models.DateField()
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)
    dateAt = models.DateTimeField(auto_now_add=True)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)
    userAuth = models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING)
    comments = models.TextField(null=True, blank=True)


class FatoraItems(models.Model):
    fatora = models.ForeignKey(Fatora, on_delete=models.DO_NOTHING)
    # rawMaterial = models.ForeignKey(RawMaterialItem,
    #                                 on_delete=models.DO_NOTHING,
    #                                 null=True, blank=True)
 
    quantity = models.FloatField(default=0)
    uploadWeight = models.FloatField(default=0)
    downloadWeight = models.FloatField(default=0)
    cabsa = models.FloatField(default=0)
    dateAt = models.DateTimeField(auto_now=True)
    unitCostPrice = models.FloatField(default=0)
    salePrice = models.FloatField(default=0)
