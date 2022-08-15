from django.shortcuts import render
from django.http import JsonResponse
from agora_token_builder import RtcTokenBuilder
import random
import time
import json

from .models import RoomMember

from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def getToken(request):
    #Build token with uid
    appId = '29f40bf594ee417cabbd74e1fc43b36b'
    appCertificate = '17509ce6415245f9add958f848586393'
    channelName = request.GET.get('channel')
    uid = random.randint(1, 230)
    
    expirationTimeInSeconds = 3600 * 24
    currentTimeStamp = time.time()
    privilegeExpiredTs = currentTimeStamp + expirationTimeInSeconds
    role = 1 # host = 1 or guest = 2

    token = RtcTokenBuilder.buildTokenWithUid(appId, appCertificate, channelName, uid, role, privilegeExpiredTs)
    return JsonResponse({'token': token, 'uid': uid}, safe=False)


def lobby(request):
    return render(request, 'base/lobby.html')

def room(request):
    return render(request, 'base/room.html')

@csrf_exempt
def createMember(request):
    data = json.loads(request.body)

    member, created = RoomMember.objects.get_or_create(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name']
    )
    return JsonResponse({'name': data['name']}, safe=False)

def getMember(request):
    uid = request.GET.get('uid')
    room_name = request.GET.get('room_name')

    member = RoomMember.objects.get(
        uid = uid,
        room_name = room_name,
    )

    name = member.name
    return JsonResponse({'name': member.name}, safe=False)

@csrf_exempt
def deleteMember(request):
    data = json.loads(request.body)

    member = RoomMember.objects.get(
        name = data['name'],
        uid = data['UID'],
        room_name = data['room_name'],
    )
    member.delete()
    return JsonResponse('Member was deleted', safe=False)