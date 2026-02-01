from rest_framework import permissions
from rest_framework import pagination
from rest_framework.response import Response

from django.contrib.auth.models import User

from Apps.Agents.models import Agents, CommercialYear, InitAgentsBalance, Branch,FatoraItems
from Apps.Box.models import BoxTransaction, InitBranchBox
from Apps.Users.models import Users
from Apps.Box.api.serializers import BoxTransactionSerializer
from Apps.Agents.api.serializers import FatoraItemsSerializer


from decimal import Decimal

class HasFullPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        auth = request.user.id
        usrList = Users.objects.filter(auth=auth, permission=1)
        return usrList.count() > 0


class HasAddOnlyPermission(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        auth = request.user.id
        usrList = Users.objects.filter(auth=auth, permission__in=[2, 1])
        return usrList.count() > 0


class StandartPagination100(pagination.PageNumberPagination):
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000


class StandartPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000


def getMigratedYear(yearId):
    cm = CommercialYear.objects.all().order_by('-pk')
    id = 0
    for idx, x in enumerate(cm):
        if x.pk == yearId:
            id = idx+1
    if id <= 0 or id >= len(cm):
        return None
    curYear = cm[id-1]
    oldYear = cm[id]
    return {'curYear': curYear, 'oldYear': oldYear}


class StandartPaginationQuantity(pagination.PageNumberPagination):
    totalQuantity = 0
    page_size = 100
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response({
            'totalQuantity': self.totalQuantity,
            'count': self.page.paginator.count,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


def getBranch(id):
    usr = Users.objects.filter(auth=id)
    if usr.count() > 0:
        return usr[0].branch
    return None


def getPrivilege(id):
    usr = Users.objects.filter(auth=id)
    if usr.count() > 0:
        return usr[0].privilege
    return None


def getAgentBallance(agentId, yearId, details):
    initDenar = 0
    initDollar = 0
    initYuan = 0
    denar = 0
    dollar = 0
    yuan = 0
    id = 0
    qs = InitAgentsBalance.objects.filter(agent=agentId, yearId=yearId)
    if qs.count() > 0:
        initDenar = qs[0].initDenar
        initDollar = qs[0].initDollar
        initYuan = qs[0].initYuan
        id = qs[0].pk
    else:
        year = CommercialYear.objects.get(pk=yearId)
        agnt = Agents.objects.get(pk=agentId)
        t = InitAgentsBalance(agent=agnt, yearId=year,
                              initDenar=0, initDollar=0, initYuan=0)
        t.save()
        id = t.pk
    denar = initDenar
    dollar = initDollar
    yuan = initYuan

    fatoraList = FatoraItems.objects.filter(fatora__agent=agentId,
                                       fatora__yearId=yearId,
                                       fatora__deleted=False,
                                       deleted=False).order_by('-fatora__pk')
    for x in fatoraList:
        dollar += Decimal(x.quantity * x.unitPrice)


    bx = BoxTransaction.objects.filter(toAgent=agentId,
                                       yearId=yearId,
                                       deleted=False).order_by('-pk')
    for x in bx:
        if x.toCurrency == 1:
            denar += x.toAmount
        elif x.toCurrency == 2:
            dollar += x.toAmount
        elif x.toCurrency == 3:
            yuan += x.toAmount

    bxFrom = BoxTransaction.objects.filter(fromAgent=agentId,
                                           yearId=yearId,
                                           deleted=False).order_by('-pk')
    for x in bxFrom:
        if x.fromCurrency == 1:
            denar -= x.fromAmount
        elif x.fromCurrency == 2:
            dollar -= x.fromAmount
        elif x.fromCurrency == 3:
            yuan -= x.fromAmount

    detailsItems = []
    if details == 1:
        for x in fatoraList:
            detailsItems.append({'date': x.fatoraDate,
                                 'type': 'fatora',
                                 'd': FatoraItemsSerializer(x).data})

        for x in bx:
            detailsItems.append({'date': x.transactionDate,
                                 'type': 'boxTransaction',
                                 'd': BoxTransactionSerializer(x).data})
        for x in bxFrom:
            detailsItems.append({'date': x.transactionDate,
                                 'type': 'boxTransaction',
                                 'd': BoxTransactionSerializer(x).data})

    return {'initId': id,
            'initDenar': initDenar,
            'denar': denar,
            'initDollar': initDollar,
            'dollar': dollar,
            'initYuan': initYuan,
            'yuan': yuan,
            'details': detailsItems}
  

def getBoxBallance(branchId, yearId, details):
    denar = 0
    dollar = 0
    yuan = 0
    initDenar = 0
    initDollar = 0
    initYuan = 0
    initId = 0
    gData = []
    initQs = InitBranchBox.objects.filter(yearId=yearId, branch=branchId)
    if initQs.count() > 0:
        initDenar = initQs[0].denar
        initDollar = initQs[0].dollar
        initYuan = initQs[0].yuan
        initId = initQs[0].pk
    else:
        year = CommercialYear.objects.get(pk=yearId)
        brqs = Branch.objects.get(pk=branchId)
        t = InitBranchBox(yearId=year, branch=brqs)
        t.save()
        initId = t.pk
    denar = initDenar
    dollar = initDollar
    yuan = initYuan
    fromBox = BoxTransaction.objects.filter(yearId=yearId, branch=branchId,
                                            deleted=False, fromBox=True)

    toBox = BoxTransaction.objects.filter(yearId=yearId, branch=branchId,
                                          deleted=False, toBox=True)
    for x in fromBox:
        if x.fromCurrency == 1:
            denar -= x.fromAmount
        elif x.fromCurrency == 2:
            dollar -= x.fromDollar
        elif x.fromCurrency == 3:
            yuan -= x.fromYuan

    for x in toBox:
        if x.toCurrency == 1:
            denar += x.toAmount
        elif x.toCurrency == 2:
            dollar += x.toDollar
        elif x.toCurrency == 3:
            yuan += x.toYuan

    if details == 1:
        gData = BoxTransactionSerializer(fromBox,
                                         many=True).data + BoxTransactionSerializer(toBox,
                                                                                    many=True).data
    return {
        'initId': initId,
        'initDenar': initDenar,
        'denar': denar,
        'initDollar': initDollar,
        'dollar': dollar,
        'initYuan': initYuan,
        'yuan': yuan,
        'details': gData}


# def doMigrate(yearId, opType):
#     cm = CommercialYear.objects.filter(pk__lte=yearId).order_by('-pk')
#     curYear = cm[0]
#     oldYear = cm[1]
#     if cm.count() < 2:
#         return False
#     if opType == 'agents':
#         agList = Agents.objects.filter(deleted=False)
#         for br in agList:
#             b = getAgentBallance(br.pk, oldYear.pk, 0)
#             initB = InitAgentsBalance.objects.filter(agent=br.pk,
#                                                      yearId=curYear.pk)
#             if initB.count() == 0:
#                 t = InitAgentsBalance(agent=br, yearId=curYear,
#                                       denar=b['denar'])
#                 t.save()
#             else:
#                 t = initB[0]
#                 t.denar = b['denar']
#                 t.save()

#     elif opType == 'rawMaterial':
#         branchList = Branch.objects.filter(deleted=False)
#         for br in branchList:
#             rawList = RawMaterialItem.objects.filter(branch=br.pk,
#                                                      deleted=False)
#             for rm in rawList:
#                 b = getRawMaterialItemBallance(br.pk, oldYear.pk, rm.pk, 0)
#                 initB = InitRawMaterialBalance.objects.filter(rawMaterial=rm.pk,
#                                                               deleted=False,
#                                                               yearId=curYear.pk)
#                 if initB.count() == 0:
#                     t = InitRawMaterialBalance(rawMaterial=rm, yearId=curYear,
#                                                initQuantity=b['quantity'])
#                     t.save()
#                 else:
#                     t = initB[0]
#                     t.initQuantity = b['quantity']
#                     t.save()

#     elif opType == 'production':
#         branchList = Branch.objects.filter(deleted=False)
#         for br in branchList:
#             prodList = ProductionItem.objects.filter(branch=br.pk,
#                                                      deleted=False)
#             for prod in prodList:
#                 b = getProductionItemBallance(br.pk, oldYear.pk, prod.pk, 0)
#                 initB = InitProductionItemBalance.objects.filter(produdct=prod.pk,
#                                                                  deleted=False,
#                                                                  yearId=curYear.pk)
#                 if initB.count() == 0:
#                     t = InitProductionItemBalance(produdct=prod,
#                                                   yearId=curYear,
#                                                   initQuantity=b['quantity'],
#                                                   initCabsa=b['cabsa'],
#                                                   )
#                     t.save()
#                 else:
#                     t = initB[0]
#                     t.initQuantity = b['quantity']
#                     t.initCabsa = b['cabsa']
#                     t.save()
#     elif opType == 'box':
#         branchList = Branch.objects.filter(deleted=False)
#         for br in branchList:
#             b = getBoxBallance(br.pk, oldYear.pk, 0)
#             initB = InitBranchBox.objects.filter(branch=br.pk,
#                                                  yearId=curYear.pk)
#             if initB.count() == 0:
#                 t = InitBranchBox(branch=br,
#                                   yearId=curYear,
#                                   denar=b['denar'])
#                 t.save()
#             else:
#                 t = initB[0]
#                 t.denar = b['denar']
#                 t.save()

#     return True
