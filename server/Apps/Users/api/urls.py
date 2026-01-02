from django.urls import path
from . import views

app_name = 'Users'

urlpatterns = [

    path('getAuth/', views.Users_getAuthId.as_view()),
    path('database/download/', views.DownloadDatabase.as_view()),

    path('list/', views.UsersListAll.as_view()),
    path('edit/<int:pk>/', views.UsersRUD.as_view()),
    path('rud/<int:pk>/', views.UsersRUD.as_view()),
    path('create/', views.UsersCreate.as_view()),

    path('info/', views.UsersList.as_view()),

    path('makechange/', views.Users_ResetPasword.as_view()),
    path('userStatus/', views.UsersStatus.as_view()),

    path('makechangePlus/', views.UsersChangePasword.as_view()),
    path('commercialYear/list/', views.CommercialYearList.as_view()),


    path('branch/create/', views.BranchCreate.as_view()),
    path('branch/list/', views.BranchList.as_view()),
    path('branch/edit/<int:pk>/', views.BranchRUD.as_view()),

]
