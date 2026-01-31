from datetime import datetime, timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.serializers import SerializerMethodField

from Apps.Agents.models import Agents, Branch, CommercialYear,  Fatora, FatoraItems
from Apps.Users.models import Users


user_profile = User


class AgentsSerializer(serializers.ModelSerializer):
    loginName = SerializerMethodField()

    def get_loginName(self, obj):
        usr = Users.objects.filter(agent=obj.pk)
        if usr.count() > 0:
            return usr[0].auth.username
        return ''

    class Meta:
        verbose_name = 'Agents List'
        model = Agents
        fields = '__all__'


class BranchSerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'Branch List'
        model = Branch
        fields = '__all__'


class CommercialYearSerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'CommercialYear List'
        model = CommercialYear
        fields = '__all__'

# ----------------------------------------------------------------------------------------
# class PostBooksShortListSerializer(serializers.ModelSerializer):
#     title = SerializerMethodField()

#     def get_title(self, obj):
#         return obj.code + '  -  ' + obj.date.strftime("%Y/%m/%d")

#     class Meta:
#         verbose_name = 'PostBooks List'
#         model = PostBook
#         fields = ['id', 'title']


# class PostBooksSerializer(serializers.ModelSerializer):
#     sectionTitle = SerializerMethodField()

#     def get_sectionTitle(self, obj):
#         if obj.section is not None:
#             return obj.section.title
#     documents = SerializerMethodField()

#     def get_documents(self, obj):
#         doc = Documents.objects.filter(postBook=obj.pk, deleted=False)
#         return DocumentsSerializer(doc, many=True).data

#     class Meta:
#         verbose_name = 'PostBooks List'
#         model = PostBook
#         fields = '__all__'


class FatoraItemsDetailseSerializer(serializers.ModelSerializer):
    info = SerializerMethodField()

    def get_info(self, obj):
        return FatoraSerializer(obj.fatora).data

    rawMaterialTitle = SerializerMethodField()

    def get_rawMaterialTitle(self, obj):
        if obj.rawMaterial is not None:
            return obj.rawMaterial.title

    productItemTitle = SerializerMethodField()

    def get_productItemTitle(self, obj):
        if obj.productItem is not None:
            return obj.productItem.title

    class Meta:
        verbose_name = 'FatoraItems List'
        model = FatoraItems
        fields = '__all__'


class FatoraItemsSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'FatoraItems List'
        model = FatoraItems
        exclude = ['externalURL', 'deleted']


class FatoraSerializer(serializers.ModelSerializer):
    agentInfo = SerializerMethodField()

    def get_agentInfo(self, obj):
        return AgentsSerializer(obj.agent).data if obj.agent is not None else None

    items = SerializerMethodField()

    def get_items(self, obj):
        lst = FatoraItems.objects.filter(fatora=obj.pk, deleted=False)
        return FatoraItemsSerializer(lst, many=True).data

    class Meta:
        verbose_name = 'Fatora List'
        model = Fatora
        exclude = ['deleted']
