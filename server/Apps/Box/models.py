import os
from django.db import models
from django.contrib.auth import get_user_model


from Apps.Agents.models import Agents, Fatora
from Apps.Users.models import Branch, CommercialYear, Users
 

USER_MODEL = get_user_model()


def get_upload_path(instance, filename):
    return os.path.join("Box", "%s" % instance.boxTransaction.yearId.title +
                        " %s" % instance.boxTransaction.branch.pk +
                        " %s" % instance.boxTransaction.dateAt.strftime("%Y-%m-%d"), filename)


class InitBranchBox(models.Model):
    denar = models.FloatField(default=0)
    dollae = models.FloatField(default=0)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)
 


class Category(models.Model):
    title = models.CharField(max_length=90)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)
    inProfit = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)


class BoxTransaction(models.Model):
    fromAmount = models.FloatField(default=0, help_text='المبلغ ')
    fromBox = models.BooleanField(default=False)
    fromAgent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING,
                                  related_name='ffrrooAgent', null=True, blank=True)
    fromCurrency= models.BooleanField(default=True)
    
    toAmount = models.FloatField(default=0)
    toBox = models.BooleanField(default=False)
    toAgent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING,
                                related_name='ttooAgent', null=True, blank=True)
    toCurrency= models.BooleanField(default=True)
 
    category = models.ForeignKey(Category, on_delete=models.DO_NOTHING,
                                 null=True, blank=True)
    comments = models.TextField(null=True, blank=True)
    transactionDate = models.DateField()
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)
    dateAt = models.DateTimeField(auto_now_add=True)
    userAuth = models.ForeignKey(USER_MODEL, on_delete=models.DO_NOTHING)
    deleted = models.BooleanField(default=False)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)


class Documents(models.Model):
    boxTransaction = models.ForeignKey(BoxTransaction,
                                       on_delete=models.DO_NOTHING)
    img = models.ImageField(upload_to=get_upload_path)
    deleted = models.BooleanField(default=False)
