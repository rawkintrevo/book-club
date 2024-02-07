# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`
from typing import Any

from firebase_functions import storage_fn, options, https_fn, logger

from firebase_admin import initialize_app, firestore
from firebase_admin import storage as fb_storage

from google.cloud import firestore as gc_firestore
from google.cloud import storage

from pdf_article import process_article
from epub import process_epub_to_book_dict, book_dict_to_markdown

import os
import uuid
import openai
import requests

initialize_app()
db = firestore.client()


@https_fn.on_call()
def downloadAndUpload(req: https_fn.CallableRequest) -> Any:
    # Get the parameters from the request
    logger.log("downloadAndUpload called")
    url = req.data['url']
    userId = req.data['userId']
    docId = req.data['docId']

    logger.log(f"parameters successfully parsed:\nurl: {url}\nuserId: {userId}\ndocId: {docId}")
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

    return {'success': True}

@storage_fn.on_object_finalized(timeout_sec=300, memory=options.MemoryOption.MB_512)
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

    user_uid = file_name.split('/')[0]
    file_name_wo_path = ''.join(file_name.split('/')[-1])
    if verbose: print(f"uid: {user_uid}")

    # TODO:
    #  1. write an empty object
    #  2. update created field of user to include ref to id of empty object created
    user_ref = db.collection('users').document(user_uid)
    user_name = user_ref.get().get('displayName')
    print(f"User Name: {user_name}")
    uuid_value = file_name.split('/')[1].split('.')[0]
    output = {'id': uuid_value, 's3': {'bucket': bucket_name, 'key': file_name}, 'ratings': [], 'saves': [], 'tags': [],
              'short_description': '', 'avg_rating': 0.00, 'n_saves': 0, 'created': gc_firestore.SERVER_TIMESTAMP,
              'views': 0, 'status': 'creating', 'title': 'New Content',
              'created_by': {'name': user_name, 'id': user_uid}}
    doc_ref = db.collection('content').document(uuid_value)
    doc_ref.set(output)
    user_ref = db.collection('users').document(user_uid)
    user_data = user_ref.get().to_dict()
    # if verbose: print(f"user_data: ", user_data)
    created_by_data = user_data.get('created_by', {})
    created_by_data[output['id']] = {'title': "Processing...", 'status': output['status']}
    user_ref.update({'created_by': created_by_data})

    # Download the file to a temporary location
    temp_file = '/tmp/' + file_name_wo_path
    file.download_to_filename(temp_file)
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    # Process the file (e.g., perform some operations or store it in a database)
    if file_name.endswith(".pdf"):
        if verbose: print('Ends with ".pdf" processing as journal article.')
        output2 = process_article(temp_file, doc_ref, verbose)
    elif file_name.endswith(".epub"):
        book_dict = process_epub_to_book_dict(temp_file)
        print("Book Dict Created: ")
        print(f"- title: {book_dict['title']}")
        output2 = book_dict_to_markdown(book_dict)

    output.update(output2)
    output['status'] = 'finished'
    doc_ref.set(output)
    # Delete the temporary file
    os.remove(temp_file)
    # Return a response (optional)
    return 'File upload handled successfully'
