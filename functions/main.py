# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn, storage_fn
from firebase_admin import initialize_app, firestore

from google.cloud import storage

import os

initialize_app()
db = firestore.client()


@storage_fn.on_object_finalized()
def handle_upload(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
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

    # Process the file (e.g., perform some operations or store it in a database)
    # ...
    doc_ref = db.collection('books').document('foo2')
    doc_ref.set({'baz': True})
    # Delete the temporary file
    os.remove(temp_file)

    # Return a response (optional)
    return 'File upload handled successfully'
# initialize_app()
#
#
# @https_fn.on_request()
# def on_request_example(req: https_fn.Request) -> https_fn.Response:
#     return https_fn.Response("Hello world!")
