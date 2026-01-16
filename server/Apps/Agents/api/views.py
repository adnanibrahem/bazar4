from django.contrib.auth.hashers import make_password
import calendar
import pytesseract
from PIL import Image
from django.utils import tree
import openpyxl
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import pagination
import pytz


from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from rest_framework.views import APIView

from django.views.generic.base import View

from django.db.models.query_utils import Q

from Apps.Agents.api.serializers import AgentsSerializer, BranchSerializer, CommercialYearSerializer
from Apps.Agents.models import Agents, Branch, CommercialYear, InitAgentsBalance
from Apps.Users.models import Users
from Apps.lib import getAgentBallance, getBranch, getPrivilege


user_profile = User


class CommercialYearList(ListAPIView):
    serializer_class = CommercialYearSerializer

    def get_queryset(self):
        y = datetime.now().year
        title = str(y)
        qr = CommercialYear.objects.filter(title=title)
        if qr.count() == 0:
            ac = CommercialYear(title=title)
            ac.save()

        queryset = CommercialYear.objects.all().order_by('-pk')
        return queryset


#  branches

class BranchList(ListAPIView):
    serializer_class = BranchSerializer
    queryset = Branch.objects.filter(deleted=False)


class BranchCreate(CreateAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer


class BranchRUD(RetrieveUpdateDestroyAPIView):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = Branch.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


#  Agents

class AgentsCreate(CreateAPIView):
    queryset = Agents.objects.all()
    serializer_class = AgentsSerializer

    def create(self, request, *args, **kwargs):
        data = request.data
        br = getBranch(self.request.user.id)
        request.data['branch'] = br.id
        request.data['userAuth'] = self.request.user.id
        r = super().create(request, *args, **kwargs)
        cm = CommercialYear.objects.all().order_by('-pk')
        sp = Agents.objects.filter(pk=r.data['id'])
        b = InitAgentsBalance(initDenar=data['initDenar'],
                              initDollar=data['initDollar'],
                              agent=sp[0],
                              yearId=cm[0])
        b.save()
        return r


class AgentsRUD(RetrieveUpdateDestroyAPIView):
    queryset = Agents.objects.all()
    serializer_class = AgentsSerializer
    lookup_fields = ('pk')

    def put(self, request, *args, **kwargs):
        data = request.data
        init = InitAgentsBalance.objects.filter(pk=data['initId'])
        if init.count() > 0:
            t = init[0]
            t.initDenar = data['initDenar']
            t.initDollar = data['initDollar']
            t.save()
        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        sp = Agents.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AgentsList(ListAPIView):
    serializer_class = AgentsSerializer

    def get_queryset(self):
        br = getBranch(self.request.user.id)
        queryset = Agents.objects.filter(branch=br, deleted=False)
        return queryset


class AgentsResetPasword(APIView):
    def post(self, request):
        prv = getPrivilege(request.user.id)
        if prv == 'accountant':
            data = request.data
            agentUsers = Users.objects.filter(agent=data['id'])
            if agentUsers.count() > 0:
                quser = agentUsers[0].auth
                quser.set_password('12345')
                quser.save()
                return Response({'error': False, 'msg':   'تم الخزن'},  status=status.HTTP_200_OK)

        return Response({'error': True, 'msg':   'ليس من صلاحياتك'},  status=status.HTTP_200_OK)


class AgentsActivateLoginName(APIView):
    def post(self, request):
        prv = getPrivilege(request.user.id)
        if prv == 'accountant':
            data = request.data

            agentUsers = Users.objects.filter(agent=data['id'])
            if agentUsers.count() == 0:
                tes = User.objects.filter(username=data['loginName'])
                if tes.count() > 1:
                    return Response({'error': True, 'msg': 'اسم المستخدم مكرر'},  status=status.HTTP_200_OK)

                qUser = User(username=data['loginName'],
                             first_name=data['title'],
                             last_name="", is_active=True,
                             password=make_password('12345'))
                qUser.save()
                agnt = Agents.objects.get(pk=data['id'])
                guser = Users(auth=qUser, privilege='agent', agent=agnt)
                guser.save()
                return Response({'error': False, 'msg':   'تم الخزن'},  status=status.HTTP_200_OK)
            else:
                t = agentUsers[0].auth
                t.username = data['loginName']
                t.save()
                return Response({'error': False, 'msg':   'تم الخزن'},  status=status.HTTP_200_OK)

        return Response({'error': True, 'msg':   'ليس من صلاحياتك'},  status=status.HTTP_200_OK)


class AgentsBalance(APIView):
    def get(self, request, details, id, yearId):
        r = getAgentBallance(id, yearId, details)
        return Response(r,  status=status.HTTP_201_CREATED)
