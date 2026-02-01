
import json
from rest_framework.response import Response
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.views import APIView

from Apps.lib import HasAddOnlyPermission, HasFullPermission
from .serializers import UsersInfoSerializer
from ..models import Users
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.db import IntegrityError
from django.http import JsonResponse
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import status
from datetime import datetime
import string
import random
import zipfile


class DownloadDatabase(APIView):
    def get(self, request):
        sender = request.user.id
        usrInfo = Users.objects.filter(auth=sender, privilege='admin')
        if usrInfo.count() == 0:
            return Response({'url': ''},  status=status.HTTP_201_CREATED)

        zipf = zipfile.ZipFile('Media/archive/StarInstitute.sqlite3.zip',
                               'w', zipfile.ZIP_DEFLATED)
        zipf.write('StarInstitute.sqlite3')
        zipf.close()
        url = 'https://ruaaalraied.com/Media/archive/StarInstitute.sqlite3.zip'
        return Response({'url': url},  status=status.HTTP_201_CREATED)


class Users_getAuthId(APIView):
    def post(self, request, format=None):
        data = request.data
        usrName = data['username']
        if usrName == '':
            while True:
                usrName = ''.join(random.choice(string.ascii_lowercase)
                                  for _ in range(5))
                sql = User.objects.filter(username=usrName)
                if sql.count() == 0:
                    break

        exsql = User.objects.filter(username=usrName)
        if exsql.count() > 0:
            dataOut = [{'auth': exsql[0].pk}, {}]
            return Response(dataOut,  status=status.HTTP_201_CREATED)

        qUser = User(username=usrName,
                     first_name=data['fullname'],
                     #  email=data['email'],
                     last_name="",
                     is_active=True,
                     password=make_password('12345'))
        qUser.save()
        qqUsr = User.objects.get(username=usrName)

        dataOut = [{'auth': qqUsr.pk}, {}]
        return Response(dataOut,  status=status.HTTP_201_CREATED)


class UsersCreate(CreateAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersInfoSerializer

    def create(self, request, *args, **kwargs):
        authUser = User.objects.filter(username=request.data['username'])

        if authUser.count() == 0:
            authUser = User(username=request.data['username'],
                            first_name=request.data['firstName'],
                            last_name="",
                            is_active=True,
                            password=make_password('12345'))
            authUser.save()

            if hasattr(request.data, '_mutable'):
                request.data._mutable = True
                request.data['auth'] = authUser.pk
                request.data._mutable = False
            else:
                request.data['auth'] = authUser.pk

            return super().create(request, *args, **kwargs)


class UsersRUD(RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UsersInfoSerializer
    lookup_fields = ('pk')

    def put(self, request, *args, **kwargs):

        usr = User.objects.filter(pk=request.data['auth'])
        if usr.count() > 0:
            t = usr[0]
            t.username = request.data['username']
            t.first_name = request.data['firstName']
            t.save()

        return self.update(request, *args, **kwargs)


class UsersList(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UsersInfoSerializer

    def get_queryset(self):

        auth = self.request.user.id
        queryset = Users.objects.filter(Q(auth=auth))
        return queryset


class UsersChangePasword(APIView):
    def post(self, request, format=None):
        try:
            data = request.data

            sender = request.user.id

            quser = authenticate(
                request, username=data['username'], password=data['currentPassword'])

            if quser is not None:
                if sender == quser.pk:
                    quser.set_password(data['newPassword1'])
                    quser.save()

                return Response(True, status=201)
            else:
                return Response(False, status=400)

        except IntegrityError as e:

            return Response(e.message, status=400)


class UsersStatus(APIView):
    def post(self, request, format=None):

        if request.user.is_staff == False:
            return Response({"result": 'Not ok , error'},
                            status=status.HTTP_201_CREATED)

        data = request.data
        quser = User.objects.get(pk=data['id'])
        quser.is_active = data['status']
        quser.save()

        return Response(True,
                        status=status.HTTP_201_CREATED)


class Users_ResetPasword(APIView):
    def post(self, request, format=None):

        if request.user.is_staff == False:
            return Response({"result": 'Not ok , error'},
                            status=status.HTTP_201_CREATED)

        data = request.data
        quser = User.objects.get(pk=data['id'])
        quser.set_password('12345')
        quser.save()

        return Response(True,
                        status=status.HTTP_201_CREATED)


class UsersListAll(ListAPIView):
    serializer_class = UsersInfoSerializer

    def get_queryset(self):
        if self. request.user.is_active:
            queryset = Users.objects.filter(deleted=False).exclude(privilege='agent')
            return queryset
        return None


class AgentAssistantlist(ListAPIView):
    serializer_class = UsersInfoSerializer

    def get_queryset(self):
        auth = self. request.user.id
        userAuth = Users.objects.filter(auth=auth)
        if userAuth.count() == 0:
            return None

        if userAuth[0].privilege == 'agent':
            queryset = Users.objects.filter(branch=auth)
            return queryset
        return None
