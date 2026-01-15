from rest_framework import serializers
from django.contrib.auth.models import User

from ..models import Branch, CommercialYear,  Users
from rest_framework.serializers import SerializerMethodField
import string
import random


class pUserSerializer(serializers.ModelSerializer):
    class Meta:
        verbose_name = 'User List'
        model = User
        fields = ['id',
                  'username',
                  'is_staff',
                  'first_name',
                  'last_name',
                  'is_active']


class CommercialYearSerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'CommercialYear List'
        model = CommercialYear
        fields = '__all__'


class BranchSerializer(serializers.ModelSerializer):

    class Meta:
        verbose_name = 'Branch List'
        model = Branch
        fields = '__all__'


# class UsersSerializer(serializers.ModelSerializer):
#     username = SerializerMethodField()
#     firstName = SerializerMethodField()
#     token = SerializerMethodField()

#     def get_token(self, obj):
#         return ''

#     def get_username(self, obj):
#         if obj.auth is not None:
#             return obj.auth.username
#         return None

#     def get_firstName(self, obj):
#         return obj.auth.first_name

#     class Meta:
#         verbose_name = 'Users List'
#         model = Users
#         fields = '__all__'


class UsersInfoSerializer(serializers.ModelSerializer):
    def getRstCode(self, dd, x):
        chars = string.ascii_lowercase + dd+string.ascii_uppercase
        code = ''.join(random.choice(chars) for _ in range(255))
        r = random.randint(3, 240)
        return code[r:]+x+code[:r]

    username = SerializerMethodField()
    firstName = SerializerMethodField()
    token = SerializerMethodField()
    branchTitle = SerializerMethodField()

    def get_branchTitle(self, obj):
        if obj.branch is not None:
            return obj.branch.title
        return ''

    optionTime = SerializerMethodField()

    enable = SerializerMethodField()

    #   3 = admin
    #   4 = agent
    #   9 = seller
    #   2 = accountant
    #   8 = store

    def get_optionTime(self, obj):
        if obj.auth:
            if obj.auth.is_staff or obj.privilege == 'admin':
                cipher = self.getRstCode('012456789', '3')
                return cipher

            if obj.privilege == 'agent':
                cipher = self.getRstCode('01256789', '4')
                return cipher

            if obj.privilege == 'seller':
                cipher = self.getRstCode('0125678', '9')
                return cipher

            if obj.privilege == 'accountant':
                cipher = self.getRstCode('015678', '2')
                return cipher

            if obj.privilege == 'store':
                cipher = self.getRstCode('01567', '8')
                return cipher

        return ''

    def get_token(self, obj):
        return ''

    def get_enable(self, obj):
        if obj.auth is not None:
            return obj.auth.is_active

    def get_username(self, obj):
        if obj.auth is not None:
            return obj.auth.username

    def get_firstName(self, obj):
        if obj.auth is not None:
            return obj.auth.first_name

    class Meta:
        verbose_name = 'Users info'
        model = Users
        fields = '__all__'
