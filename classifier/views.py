from this import d
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
# Create your views here.
from django.http import HttpResponse, JsonResponse
import tensorflow as tf
import numpy as np
import os

model = tf.keras.models.load_model('classifier/model')
print(model.summary())

def normalize(data):
    data = data+(-1*min(data))
    return data/100

def index(request):
    return render(request, "classifier/index.html")

@csrf_exempt
def model_predict(request):
    result = request.POST.getlist('img[]')
    
    result = list(map(int, result))
    image = np.array(result)
    image = image.reshape((150, 150))
    newimg = tf.compat.v1.image.resize(np.expand_dims(image, axis=2), (28, 28))
    newimg = tf.keras.utils.array_to_img(newimg)
    newimg = tf.keras.utils.img_to_array(np.expand_dims(newimg, axis=2))
    prediction = model.predict(np.expand_dims(newimg, axis=0))
    pred = list(prediction[0]).index(max(prediction[0]))
    prediction = normalize(prediction[0])
    print(prediction)

    data = {
            "prediction": pred,
            "pred_array": prediction.tolist()
    }
    return JsonResponse(data)