from typing import Any
from firebase_functions import storage_fn, options, https_fn, logger, scheduler_fn
from firebase_admin import initialize_app, firestore

from nightly_feeds import new_hf_papers
from download_and_upload import download_and_upload
from handle_upload import handle_upload as handle_upload_local

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
    download_and_upload(url, userId, docId)

    return {'success': True}

@storage_fn.on_object_finalized(timeout_sec=300, memory=options.MemoryOption.MB_512)
def handle_upload(event: storage_fn.CloudEvent[storage_fn.StorageObjectData]):
    verbose=True
    # Get the file name and bucket name from the event data
    file_name = event.data.name
    bucket_name = event.data.bucket
    handle_upload_local(bucket_name, file_name, db, verbose)

    # Return a response (optional)
    return 'File upload handled successfully'

@scheduler_fn.on_schedule(schedule="every day 00:33")
def get_hf_papers(event: scheduler_fn.ScheduledEvent):
    new_hf_papers()
