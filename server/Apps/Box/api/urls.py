from django.urls import path
from . import views

app_name = 'Box'

urlpatterns = [

#     path('migrate/<int:yearId>/<slug:opType>/', views.MakeMigarte.as_view()),

 
    path('category/list/', views.CategoryList.as_view()),
    path('category/create/', views.CategoryCreate.as_view()),
    path('category/edit/<int:pk>/', views.CategoryEdit.as_view()),

    path('box/ballnce/<int:details>/<int:yearId>/', views.BoxBalance.as_view()),
    path('box/admin/ballnce/<int:yearId>/<int:branchId>/',
         views.AdminGetBoxBalance.as_view()),

    path('box/initballnce/', views.BoxInitBalance.as_view()),

    path('boxTransaction/list/', views.BoxTransactionList.as_view()),
    path('boxTransaction/create/', views.BoxTransactionCreate.as_view()),
    path('boxTransaction/edit/<int:pk>/',  views.BoxTransactionEdit.as_view()),

 

        # Documents
     # path('documents/list/', views.DocumentsList.as_view()),
     # path('documents/rud/<int:pk>/', views.DocumentsRUD.as_view()),
     # path('documents/create/', views.DocumentsCreate.as_view()),

]
