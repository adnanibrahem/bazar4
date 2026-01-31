from rest_framework.permissions import AllowAny
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

from Apps.Agents.api.serializers import AgentsSerializer, BranchSerializer, CommercialYearSerializer, FatoraSerializer
from Apps.Agents.models import Agents, Branch, CommercialYear, Fatora, FatoraItems, InitAgentsBalance
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
        queryset = Agents.objects.filter(branch=br,
                                         group='agent', deleted=False)
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
        if prv == 'seller':
            data = request.data
            br = getBranch(request.user.id)
            ag = Agents.objects.filter(pk=data['id'], branch=br, deleted=False)
            if ag.count() == 0:
                return Response({'error': True, 'msg': 'الوكيل غير موجود'},  status=status.HTTP_200_OK)

            agentUsers = Users.objects.filter(agent=data['id'])
            if agentUsers.count() == 0:
                tes = User.objects.filter(username=data['loginName'])
                if tes.count() > 0:
                    return Response({'error': True, 'msg': 'اسم المستخدم مكرر'},  status=status.HTTP_200_OK)

                qUser = User(username=data['loginName'],
                             first_name=data['title'],
                             last_name="", is_active=True,
                             password=make_password('12345'))
                qUser.save()
                agnt = Agents.objects.get(pk=data['id'])
                guser = Users(auth=qUser, privilege='agent',
                              branch=br,  agent=agnt)
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


class ShowOredrs(APIView):
    permission_classes = [AllowAny]

    def transform_order_data(self, raw_data):
        order_data = raw_data.get('order_data', [])
        products = {}
        current_item_id = None
        for entry in order_data:
            name = entry['name']
            value = entry['value']
            if name == "itemsToOrder[]":
                current_item_id = value
                if current_item_id not in products:
                    products[current_item_id] = {}
                continue
            if current_item_id and name.startswith(f"{current_item_id}_"):
                clean_key = name.replace(f"{current_item_id}_", "")
                products[current_item_id][clean_key] = value
            elif name in ["new_order_type_shipping", "new_order_description"]:
                if current_item_id:
                    products[current_item_id][name] = value
        return list(products.values())

    def post(self, request):
        t = self.transform_order_data(request.data)

        if len(t) > 0:
            uer = User.objects.filter(username=request.data['customer_phone'])
            if uer.count() == 0:
                return Response({'message': 'لا يوجد مستخدم'},  status=status.HTTP_200_OK)
            agent = Users.objects.get(auth=uer[0].pk, deleted=False).agent

            ftr = Fatora(agent=agent,
                         yearId=CommercialYear.objects.all().order_by('-pk')[0])
            ftr.save()

            for x in t:
                ftitem = FatoraItems(fatora=ftr,
                                     description=x.get(
                                         'new_order_description', ''),
                                     InternalDelivery=x.get(
                                         'id', ''),
                                     quantity=float(x.get('quantity', 0)),
                                     unitPrice=float(x.get('price', 0)),
                                     itemTitle=x.get('itemTitle', ''),
                                     externalURL=x.get('externalURL', ''),
                                     pictureURL=x.get('pictureURL', ''),
                                     weight=float(x.get('weight', 0)),
                                     shippingType=x.get('new_order_type_shipping', ''))

                ftitem.save()

        return Response({'message': 'تم الخزن بنجاح'},  status=status.HTTP_200_OK)
        # return Response(t,  status=status.HTTP_200_OK)


class SellerFatoraList(ListAPIView):
    serializer_class = FatoraSerializer

    def get_queryset(self):

        br = getBranch(self.request.user.id)
        queryset = Fatora.objects.filter(agent__branch=br.pk,
                                         deleted=False).order_by('-dateAt')
        return queryset


def validUser(request, id):
    prv = getPrivilege(request.user.id)
    if prv != 'seller' and prv != 'agent':
        return False

    if prv == 'seller':
        br = getBranch(request.user.id)
        sp = Fatora.objects.filter(pk=id, agent__branch=br.pk)
        if sp.count() == 0:
            return False

    if prv == 'agent':
        usr = Users.objects.filter(auth=request.user.id, deleted=False)
        if usr.count() == 0:
            return False
        agent = usr[0].agent
        sp = Fatora.objects.filter(pk=id, agent=agent)
        if sp.count() == 0:
            return False
    return True


class SellerFatoraSendToBuyer(APIView):
    def get(self, request, pk):
        if not validUser(self.request,  pk):
            return Response(status=status.HTTP_403_FORBIDDEN)
        fr = Fatora.objects.get(pk=pk)
        fr.status = 2
        fr.buyingAt = datetime.now((pytz.timezone('Asia/Baghdad')))
        fr.buyingBy = self.request.user
        fr.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SellerFatoraRUD(RetrieveUpdateDestroyAPIView):
    queryset = Fatora.objects.all()
    serializer_class = FatoraSerializer
    lookup_fields = ('pk')

    def put(self, request, *args, **kwargs):

        if not validUser(request, kwargs.get('pk')):
            return Response(status=status.HTTP_403_FORBIDDEN)

        for x in request.data['items']:

            itm = FatoraItems.objects.get(pk=x['id'])
            itm.quantity = x['quantity']
            itm.deleted = x['deleted']
            itm.save()

        return self.update(request, *args, **kwargs)

    def delete(self, request, *args, **kwargs):
        if not validUser(request, kwargs.get('pk')):
            return Response(status=status.HTTP_403_FORBIDDEN)

        sp = Fatora.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
            item = FatoraItems.objects.filter(fatora=t.pk)
            for x in item:
                x.delete = True
                x.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
