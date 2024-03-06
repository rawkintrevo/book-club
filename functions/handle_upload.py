from google.cloud import storage
from google.cloud import firestore as gc_firestore
import openai
import os

from firebase_functions import logger

from pdf_article import process_article
from epub import process_epub_to_book_dict, book_dict_to_markdown


def handle_upload(bucket_name, file_name, db, verbose=True):
    # Create a Cloud Storage client
    storage_client = storage.Client()

    # Get the bucket and file objects
    bucket = storage_client.get_bucket(bucket_name)
    file = bucket.blob(file_name)

    user_uid = file_name.split('/')[0]
    file_name_wo_path = ''.join(file_name.split('/')[-1])


    # TODO:
    #  1. write an empty object
    #  2. update created field of user to include ref to id of empty object created
    user_ref = db.collection('users').document(user_uid)
    user_name = user_ref.get().get('displayName')
    if verbose: print(f"User Name: {user_name}")
    uuid_value = file_name.split('/')[1].split('.')[0]
    if verbose:
        print(f"uid: {user_uid} creating {uuid_value} for {user_name}")
        logger.log(f"uid: {user_uid} creating {uuid_value} for {user_name}")
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
        if verbose: logger.log('Ends with ".pdf" processing as journal article.')
        output2 = process_article(temp_file, doc_ref, verbose)
    elif file_name.endswith(".epub"):
        if verbose: print("epub")
        book_dict = process_epub_to_book_dict(temp_file)
        logger.log("Book Dict Created: " + book_dict['title'])
        output2 = book_dict_to_markdown(book_dict)

    output.update(output2)
    output['status'] = 'finished'
    doc_ref.set(output)
    # Delete the temporary file
    os.remove(temp_file)
