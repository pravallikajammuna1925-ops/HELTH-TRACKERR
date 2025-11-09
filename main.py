import cv2
import os
import time
import uuid

'''
# Set the absolute path where you want to save the images
IMAGES_PATH = '/Users/jai/RealTimeObjectDetection/Tensorflow/workspace/images'

labels = ['hello', 'thanks', 'yes', 'no', 'iloveyou']
number_img = 15

for label in labels:
    os.makedirs(os.path.join(IMAGES_PATH, label), exist_ok=True)
    cap = cv2.VideoCapture(0)
    print("Collecting images for {}" .format(label))
    time.sleep(5)
    
    for imgnum in range(number_img):
        ret, frame = cap.read()
        if not ret:
            break
        image = os.path.join(IMAGES_PATH, label, label + '.' + '{}.jpg'.format(str(uuid.uuid1())))
        cv2.imwrite(image, frame)
        cv2.imshow('frame', frame)
        time.sleep(2)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
cv2.destroyAllWindows()

'''


# Define the base workspace path
WORKSPACE_PATH = os.path.join('Tensorflow', 'workspace')
SCRIPTS_PATH = os.path.join('Tensorflow', 'scripts')
APIMODEL_PATH = os.path.join('Tensorflow', 'models')

# Define other paths using os.path.join for cross-platform compatibility
ANNOTATION_PATH = os.path.join(WORKSPACE_PATH, 'annotations')
IMAGE_PATH = os.path.join(WORKSPACE_PATH, 'images')
MODEL_PATH = os.path.join(WORKSPACE_PATH, 'models')
PRETRAINED_MODEL_PATH = os.path.join(WORKSPACE_PATH, 'pre-trained-models')
CONFIG_PATH = os.path.join(MODEL_PATH, 'my_ssd_mobnet', 'pipeline.config')
CHECKPOINT_PATH = os.path.join(MODEL_PATH, 'my_ssd_mobnet')

# Create the annotation directory if it doesn't exist
os.makedirs(ANNOTATION_PATH, exist_ok=True)

labels = [
    {'name': 'Hello', 'id': 1},
    {'name': 'Yes', 'id': 2},
    {'name': 'No', 'id': 3},
    {'name': 'Thank You', 'id': 4},
    {'name': 'I Love You', 'id': 5}
]

with open(os.path.join(ANNOTATION_PATH, 'label_map.pbtxt'), 'w') as f:
    for label in labels:
        f.write('item {\n')
        f.write('\tname: \'{}\'\n'.format(label['name']))
        f.write('\tid: {}\n'.format(label['id']))
        f.write('}\n')


SCRIPTS_PATH = "/Users/jai/RealTimeObjectDetection/Tensorflow/scripts"
IMAGE_PATH = "/Users/jai/RealTimeObjectDetection/Tensorflow/workspace/images"
ANNOTATION_PATH = "/Users/jai/RealTimeObjectDetection/Tensorflow/workspace/annotations"


!python3 "{SCRIPTS_PATH}/generate_tfrecord.py" -x "{IMAGE_PATH}/train" -l "{ANNOTATION_PATH}/label_map.pbtxt" -o "{ANNOTATION_PATH}/train.record"


!python3 "{SCRIPTS_PATH}/generate_tfrecord.py" -x "{IMAGE_PATH}/test" -l "{ANNOTATION_PATH}/label_map.pbtxt" -o "{ANNOTATION_PATH}/test.record"


