from firebase_functions import logger
from firebase_admin import storage as fb_storage
import requests
import os
def download_and_upload(url, userId, docId):
    # Download the content from the URL
    response = requests.get(url)
    content = response.content

    logger.log("Content downloaded successfully")
    # Get the file suffix from the URL
    file_suffix = os.path.splitext(url)[1]


    # Set the storage path
    storage_path = f"{userId}/{docId}{file_suffix}"
    logger.log(f"Established storage path: {storage_path}")
    # Upload the content to Cloud Storage

    bucket = fb_storage.bucket()
    blob = bucket.blob(storage_path)
    blob.upload_from_string(content)
