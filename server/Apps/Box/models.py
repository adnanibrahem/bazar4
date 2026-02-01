import os
from django.db import models
from django.contrib.auth import get_user_model


from Apps.Agents.models import Agents, Branch, CommercialYear, Fatora
from Apps.Users.models import Users


USER_MODEL = get_user_model()


def get_upload_path(instance, filename):
    return os.path.join("Box", "%s" % instance.boxTransaction.yearId.title +
                        " %s" % instance.boxTransaction.branch.pk +
                        " %s" % instance.boxTransaction.dateAt.strftime("%Y-%m-%d"), filename)


class InitBranchBox(models.Model):
    denar = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    dollar = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    yuan = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    yearId = models.ForeignKey(CommercialYear, on_delete=models.DO_NOTHING)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)


class Category(models.Model):
    title = models.CharField(max_length=90)
    branch = models.ForeignKey(Branch, on_delete=models.DO_NOTHING)
    inProfit = models.BooleanField(default=True)
    deleted = models.BooleanField(default=False)


class BoxTransaction(models.Model):
    fromAmount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fromBox = models.BooleanField(default=False)
    fromAgent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING,
                                  related_name='ffrrooAgent', null=True, blank=True)
    fromCurrency = models.IntegerField(default=1) # 1 = denar, 2 = dollar, 3 = yuan

    toAmount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    toBox = models.BooleanField(default=False)
    toAgent = models.ForeignKey(Agents, on_delete=models.DO_NOTHING,
                                related_name='ttooAgent', null=True, blank=True)
    toCurrency = models.IntegerField(default=1) # 1 = denar, 2 = dollar, 3 = yuan

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
