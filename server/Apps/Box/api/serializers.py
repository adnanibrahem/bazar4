from datetime import datetime, timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.serializers import SerializerMethodField

from Apps.Box.models import BoxTransaction, Category, Documents


user_profile = User


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'Category List'
        model = Category
        fields = '__all__'


class DocumentsSerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'Documents List'
        model = Documents
        fields = '__all__'


class BoxTransactionSerializer(serializers.ModelSerializer):
    fromAgentTitle = SerializerMethodField()
    toAgentTitle = SerializerMethodField()
    userTitle = SerializerMethodField()

    def get_userTitle(self, obj):
        if obj.userAuth is not None:
            return obj.userAuth.first_name
 

    categoryTitle = SerializerMethodField()
    documents = SerializerMethodField()

    def get_toBranchOtherAccountsTitle(self, obj):
        if obj.toBranchOtherAccounts is not None:
            return obj.toBranchOtherAccounts.title

    def get_categoryTitle(self, obj):
        if obj.category is not None:
            return obj.category.title

    def get_fromAgentTitle(self, obj):
        if obj.fromAgent is not None:
            return obj.fromAgent.title

    def get_toAgentTitle(self, obj):
        if obj.toAgent is not None:
            return obj.toAgent.title

    def get_documents(self, obj):
        doc = Documents.objects.filter(boxTransaction=obj.pk, deleted=False)
        return DocumentsSerializer(doc, many=True).data

    class Meta:
        verbose_name = 'BoxTransaction List'
        model = BoxTransaction
        fields = '__all__'


class ProfitBoxTransactionSerializer(serializers.ModelSerializer):
    userTitle = SerializerMethodField()
    categoryInfo = SerializerMethodField()

    def get_categoryInfo(self, obj):
        if obj.category is not None:
            return CategorySerializer(obj.category).data

    def get_userTitle(self, obj):
        if obj.userAuth is not None:
            return obj.userAuth.first_name

    class Meta:
        verbose_name = 'BoxTransaction List'
        model = BoxTransaction
        fields = '__all__'
