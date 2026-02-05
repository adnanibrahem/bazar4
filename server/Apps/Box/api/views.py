
from rest_framework.generics import ListAPIView, CreateAPIView, RetrieveUpdateAPIView, RetrieveUpdateDestroyAPIView
from django.contrib.auth.models import User

from rest_framework import pagination


from rest_framework.response import Response
from rest_framework import status
from datetime import datetime, timedelta
from rest_framework.views import APIView


from django.views.generic.base import View

from django.db.models.query_utils import Q

from Apps.Box.api.serializers import BoxTransactionSerializer, CategorySerializer
from Apps.Box.models import BoxTransaction, Category, InitBranchBox, CommercialYear

from Apps.lib import getBoxBallance, getBranch, getPrivilege
# from Apps.lib import  getBoxBallance, getBranch, getPrivilege


user_profile = User


# class MakeMigarte(APIView):
#     def get(self, request, yearId, opType):
#         t = doMigrate(yearId,  opType)
#         return Response(t,  status=status.HTTP_201_CREATED)


#  Category


class CategoryList(ListAPIView):
    serializer_class = CategorySerializer

    def get_queryset(self):
        br = getBranch(self.request.user.pk)
        qr = Category.objects.filter(branch=br.pk,
                                     deleted=False)
        return qr


class CategoryCreate(CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def post(self, request, *args, **kwargs):
        br = getBranch(self.request.user.pk)
        request.data['branch'] = br.pk

        return super().post(request, *args, **kwargs)


class CategoryEdit(RetrieveUpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = Category.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


#  BoxTransaction
class BoxTransactionList(ListAPIView):
    serializer_class = BoxTransactionSerializer
    data = []

    def get_queryset(self):
        # correctBoxTransaction()
        br = getBranch(self.request.user.pk)
        if br is None:
            return
        prv = getPrivilege(self.request.user.pk)

        if len(self. data) == 0:
            toDate = datetime.now().strftime("%Y-%m-%d")
            qr = BoxTransaction.objects.filter(branch=br.pk,
                                               transactionDate=toDate,
                                               deleted=False).order_by('-pk')
        if 'dtFrom' in self.data.keys() and 'dtTo' in self.data.keys():
            dtFrom = self.data['dtFrom']
            dtTo = self.data['dtTo']
            qr = BoxTransaction.objects.filter(branch=br.id,
                                               transactionDate__gte=dtFrom,
                                               transactionDate__lte=dtTo,
                                               deleted=False).order_by('-pk')
        return qr

    def post(self, request, *args, **kwargs):
        self.data = request.data
        return self.list(request, *args, **kwargs)


class BoxTransactionCreate(CreateAPIView):
    queryset = BoxTransaction.objects.all()
    serializer_class = BoxTransactionSerializer

    def post(self, request, *args, **kwargs):
        br = getBranch(self.request.user.pk)
        prv = getPrivilege(self.request.user.pk)
        cm = CommercialYear.objects.all().order_by('-pk')
        request.data['branch'] = br.pk
        request.data['userAuth'] = self.request.user.id
        request.data['yearId'] = cm[0].pk
        return super().post(request, *args, **kwargs)


class BoxTransactionEdit(RetrieveUpdateAPIView):
    queryset = BoxTransaction.objects.all()
    serializer_class = BoxTransactionSerializer
    lookup_fields = ('pk')

    def delete(self, request, *args, **kwargs):
        sp = BoxTransaction.objects.filter(pk=kwargs.get('pk'))
        if sp.count() > 0:
            t = sp[0]
            t.deleted = True
            t.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BoxInitBalance(APIView):
    def post(self, request):
        auth = self.request.user.pk
        br = getBranch(auth)
        if br is None:
            return Response(status=status.HTTP_201_CREATED)
        prv = getPrivilege(auth)
        if prv == 'accountant':
            bnls = InitBranchBox.objects.filter(pk=request.data['initId'])
            if bnls.count() > 0:
                t = bnls[0]
                t.denar = request.data['initDenar']
                t.save()

        return Response(True,  status=status.HTTP_201_CREATED)


class BoxBalance(APIView):
    def get(self, request, details, yearId):
        br = getBranch(self.request.user.pk)
        if br is None:
            return Response(status=status.HTTP_201_CREATED)
        r = getBoxBallance(br.pk, yearId, details)
        return Response(r,  status=status.HTTP_201_CREATED)


class AdminGetBoxBalance(APIView):
    def get(self, request, yearId, branchId):
        prv = getPrivilege(self.request.user.pk)
        if prv != 'admin':
            return Response(status=status.HTTP_403_FORBIDDEN)
        r = getBoxBallance(branchId, yearId, 0)
        return Response(r,  status=status.HTTP_201_CREATED)
