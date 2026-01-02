from datetime import datetime, timezone
from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework.serializers import SerializerMethodField

from Apps.Agents.models import Agents,  Fatora, FatoraItems
from Apps.Users.models import Users


 

user_profile = User


class AgentsSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'Agents List'
        model = Agents
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


class ProfitFatoraItemsSerializer(serializers.ModelSerializer):
    title = SerializerMethodField()
    fatoraDate = SerializerMethodField()

    def get_fatoraDate(self, obj):
        return obj.fatora.fatoraDate

    def get_title(self, obj):
        if obj.rawMaterial is not None:
            return obj.rawMaterial.title
        if obj.productItem is not None:
            return obj.productItem.title

    class Meta:
        verbose_name = 'FatoraItems List'
        model = FatoraItems
        fields = '__all__'


class FatoraSerializer(serializers.ModelSerializer):
    agentTitle = SerializerMethodField()
    branchTitle = SerializerMethodField()
    userTitle = SerializerMethodField()

    def get_userTitle(self, obj):
        if obj.userAuth is not None:
            return obj.userAuth.first_name

    def get_branchTitle(self, obj):
        if obj.branch is not None:
            return obj.branch.title

    def get_agentTitle(self, obj):
        if obj.agent is not None:
            return obj.agent.title

    items = SerializerMethodField()

    def get_items(self, obj):
        lst = FatoraItems.objects.filter(fatora=obj.pk)
        return FatoraItemsSerializer(lst, many=True).data

    class Meta:
        verbose_name = 'Fatora List'
        model = Fatora
        fields = '__all__'
