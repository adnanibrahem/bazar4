from django.urls import path
from . import views

app_name = 'Agents'

urlpatterns = [
    path('commercialYear/list/', views.CommercialYearList.as_view()),

    path('branch/create/', views.BranchCreate.as_view()),
    path('branch/list/', views.BranchList.as_view()),
    path('branch/edit/<int:pk>/', views.BranchRUD.as_view()),

    path('agent/create/', views.AgentsCreate.as_view()),
    path('agent/list/', views.AgentsList.as_view()),
    path('agent/edit/<int:pk>/', views.AgentsRUD.as_view()),

    path('agent/active/loginpage/', views.AgentsActivateLoginName.as_view()),
    path('agent/reset/password/', views.AgentsResetPasword.as_view()),
    path('agent/ballnce/<int:details>/<int:id>/<int:yearId>/',
         views.AgentsBalance.as_view()),


]
