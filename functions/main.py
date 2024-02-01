# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn, storage_fn
from firebase_admin import initialize_app, firestore

from google.cloud import storage

from pdf_article import process_article

import os
import uuid
import openai

initialize_app()
db = firestore.client()


@storage_fn.on_object_finalized()
def handle_upload(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
    verbose=True
    # Get the file name and bucket name from the event data
    file_name = event.data.name
    bucket_name = event.data.bucket

    # Create a Cloud Storage client
    storage_client = storage.Client()

    # Get the bucket and file objects
    bucket = storage_client.get_bucket(bucket_name)
    file = bucket.blob(file_name)

    # Download the file to a temporary location
    temp_file = '/tmp/' + file_name
    file.download_to_filename(temp_file)
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    # Process the file (e.g., perform some operations or store it in a database)
    output = process_article(temp_file, verbose)
    uuid_value = str(uuid.uuid4())
    output['id'] = uuid_value
    output['s3']['bucket'] = bucket_name
    output['s3']['key'] = file_name
    doc_ref = db.collection('articles').document(uuid_value)
    doc_ref.set(output)
    # Delete the temporary file
    os.remove(temp_file)
    # Return a response (optional)
    return 'File upload handled successfully'
