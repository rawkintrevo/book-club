import fitz  # PyMuPDF
import openai
import tiktoken
import json

from time import sleep
from firebase_functions import logger


def is_main_content(llm_response):
    # Placeholder for logic to determine if LLM response indicates end of main content
    # This could be based on keywords, sentiment, or any other criteria you define
    return "end of main content" not in llm_response


def analyze_text_chunk(text_chunk):
    sleep(0.25)
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0.1,
        messages=[
            {
                "role": "system",
                "content": """
Given the following page text from a multi-page journal article, determine if it represents the
main content or if the article has reached the conclusion (and possibly
transitioned to references or appendices. Respond with 'main content' if it is
part of the core article, or 'end of main content' if it has reached the
conclusion, references or appendices sections. Wait to see indication of a
'Conclusion', 'References', 'Bibliography' or 'Appendices' section before
declaring 'end of main content'. Make sure one of those sections is present in
the text.

Evaluations are considered part of the main content.
Anything else which could be meaningfully summarized is main content.
Benchmarks is main content.


Anything which could be meaningfully summarized is considered part of the main content.

If you are unsure, give 'main content'.

Give if 'end of main content' give your reasoning.
"""
            },
            {
                "role": "user",
                "content": text_chunk
            }])

    llm_response = completion.choices[0].message.content
    return is_main_content(llm_response)


def extract_main_content(pdf_path, doc_ref, verbose= True):
    if verbose: logger.log(f".extract_main_content - opening path: {pdf_path}")
    doc = fitz.open(pdf_path)
    full_text = ""
    chunk_size = 2  # Number of pages to read at a time

    output_s = analyze_cover(doc.load_page(0).get_text())

    if verbose: logger.log(f".extract_main_content - analyze_cover: {output_s}")
    try:
        output = json.loads(output_s, strict=False)
        logger.log('output_s: ', output_s)
        if 'authors' in output:
            output['author'] = output['authors']
        doc_ref.update(output)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")

    if verbose: logger.log(f".extract_main_content - TODO - update article with output from here...")
    if verbose: logger.log(f".extract_main_content - pdf has {len(doc)} pages")
    # Loop through each pair of pages and extract text
    for start_page in range(0, len(doc), chunk_size):
        text_chunk = ""
        end_page = min(start_page + chunk_size, len(doc))
        for page_num in range(start_page, end_page):
            page = doc.load_page(page_num)
            n_tokens = len(encoding.encode(page.get_text()))
            if n_tokens < 2000:
                if verbose: logger.log(f"Page: {page_num}, added {len(encoding.encode(page.get_text()))} tokens")
                text_chunk += page.get_text()
            else:
                if verbose: logger.log(f"Page: {page_num}, skipped {len(encoding.encode(page.get_text()))} tokens")
                continue

        # Putting this before the break ensures the last slug of text is included.
        full_text += text_chunk

        n_tokens = len(encoding.encode(text_chunk))
        if verbose: logger.log(f"attempting to analyze {n_tokens} tokens")
        if not analyze_text_chunk(text_chunk):
            logger.log("Found end of text content.")
            break  # Exit loop if LLM determines end of main content reached

    doc.close()
    output.update({"text": full_text})
    return output


def summarize(text, long_text=False):
    model="gpt-3.5-turbo"
    if long_text:
        model="gpt-3.5-turbo-16k"
    print(f"Using Model: {model}")
    sleep(0.25)
    completion = openai.ChatCompletion.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "Summarize content you are provided in great detail (at least 600 words, up to 2000 words). Do not insert knowledge beyond the document into the summary, and do not name the author or title of the work."
            },
            {
                "role": "user",
                "content": text
            }])
    return completion.choices[0].message.content


def analyze_cover(text_chunk):
    sleep(0.25)
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        temperature=0.1,
        messages=[
            {
                "role": "system",
                "content": """
Given the following cover page text from a journal article, determine the title
of the article, authors, and if available journal name. Return the response in as
a json in the following format:
{
  title: "Title of the article",
  authors: "List of authors",
  journal: "Journal name"
}"""
            },
            {
                "role": "user",
                "content": text_chunk
            }])

    llm_response = completion.choices[0].message.content
    return llm_response


def chunk_list(input_list, n):
    avg_chunk_size = len(input_list) // n
    remainder = len(input_list) % n

    chunks = []
    start = 0

    for i in range(n):
        chunk_size = avg_chunk_size + 1 if i < remainder else avg_chunk_size
        end = start + chunk_size
        chunks.append(input_list[start:end])
        start = end

    return chunks


def process_article(file_path, doc_ref, verbose= False):

    logger.log(f'process_article.verbose: {verbose}')
    output = extract_main_content(file_path, doc_ref)
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
    tokens = encoding.encode(output["text"])
    n_tokens = len(tokens)

    large_threshold = 14000
    if verbose: logger.log(f"Processing {file_path}. {n_tokens} tokens.")
    if n_tokens > large_threshold:
        if verbose: logger.log(f"Large file, splitting into chunks")
        parts = []
        chunks = chunk_list(encoding.encode(output['text']), (n_tokens // large_threshold)+1)
        logger.log(f"{len(chunks)} found to summarize")
        for i, chunk in enumerate(chunks):
            link_text = output['title']+ f"-p{i+1}"
            chunk_text = encoding.decode(chunk)
            parts.append({
                "title": [link_text],
                "authors": output['authors'],
                "journal": output['journal'],
                "text": chunk_text
            })
        output['parts'] = parts
    else:
        output['parts'] = [{"title": output['title'],
                            "authors": output['authors'],
                            "journal": output['journal'],
                            "text": output['text']
                            }]
    if verbose: print(f"{len(output['parts'])} parts found.")
    for o in output['parts']:
        long_text = False
        if len(encoding.encode(o["text"])) > 3500:
            long_text = True
        if verbose:
            print(f"summarizing article- long_text:{long_text}")
        o['summary'] = summarize(o['text'], long_text=long_text)
        o['text'] = ''
    final_output = {
        'title': output['title'],
        "type": "article",
        'author': output['authors'],
        'journal': output['journal'],
        'parts': output['parts'],

    }
    return final_output


