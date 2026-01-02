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

 
from Apps.Users.models import CommercialYear
 
user_profile = User


 