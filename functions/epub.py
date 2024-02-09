from ebooklib import epub
from bs4 import BeautifulSoup
import openai
import tiktoken
from time import sleep
from google.cloud.firestore import SERVER_TIMESTAMP

def find_highest_header(soup):
    # Initialize the highest header level as None
    highest_header = None

    # Iterate through header levels from h1 to h6
    for header_level in range(1, 7):
        header_tag = soup.find(f'h{header_level}')

        # If a header of the current level is found, update the highest_header and break
        if header_tag:
            highest_header = header_tag
            break

    return highest_header

def extract_text_from_highest_headers(soup):
    highest_headers_text = []  # Initialize a list to store text from highest headers

    # Find the highest-level header in the soup
    highest_header = find_highest_header(soup)

    # Continue finding and extracting text from highest headers until none is found
    while highest_header:
        highest_headers_text.append(highest_header.get_text())

        # Remove the highest header from the soup to find the next one
        highest_header.extract()

        # Find the next highest-level header
        highest_header = find_highest_header(soup)

    return highest_headers_text
def extract_text_from_epub(book):
    output = ""
    for item in book.items:
        if isinstance(item, epub.EpubHtml):
            content = item.get_body_content()
            soup = BeautifulSoup(content, 'html.parser')
            text = soup.get_text()
            output += text

    return output

def extract_chapters_from_epub(book):
    chapters = []
    encoding = tiktoken.get_encoding("cl100k_base")
    for item in book.items:
        if isinstance(item, epub.EpubHtml):
            content = item.get_body_content()
            soup = BeautifulSoup(content, 'html.parser')
            title = extract_text_from_highest_headers(soup)
            text = soup.get_text()
            token_count = len(encoding.encode(text))
            chapters.append({'title': title, 'token_count': token_count, 'text': text})
    return chapters

def summarize(text, long_text=False):
    model="gpt-3.5-turbo"
    if long_text:
        model="gpt-3.5-turbo-16k"
    # print(f"Using Model: {model}")
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


def summarize_string(content):
    encoding = tiktoken.get_encoding("cl100k_base")
    long_text = False
    n_tokens = len(encoding.encode(content))
    # print(f"Number of tokens: {n_tokens}")
    if n_tokens > 2000:
        long_text = True
        if n_tokens > 16000:
            print(f"------ WARNING: input is {n_tokens} long... truncating to 16000 tokens")
            encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
            content = encoding.decode(encoding.encode(content)[:16000])
    # print(f"Summarizing input")
    summary = summarize(content, long_text)
    return summary


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


def combine_dicts_by_token_count(input_dicts, token_count_threshold, large_threshold):
    """
    Combines a list of dictionaries with a given token count threshold.
    input_dicts: A list of dictionaries to be combined. Each dictionary should have a 'title', 'token_count', and 'text' key.
    token_count_threshold: combine small dicts together until they are at least this size
    large_threhold: split large dicts above this size into chunks
    """
    combined_dicts = []  # Initialize the list for combined dictionaries
    current_dict = None  # Initialize the current dictionary
    encoding = tiktoken.get_encoding("cl100k_base")
    for dictionary in input_dicts:
        if dictionary['token_count'] > large_threshold:
            # chunk up a big chapter
            chunks = chunk_list(encoding.encode(dictionary['text']), (dictionary['token_count'] // large_threshold)+1)
            for i, chunk in enumerate(chunks):
                link_text = '-'.join(dictionary['title']) + f"-p{i+1}"
                chunk_text = encoding.decode(chunk)
                combined_dicts.append({
                    "title": [link_text],
                    "token_count": len(chunk),
                    "text": chunk_text
                })
        elif current_dict is None or current_dict['token_count'] + dictionary['token_count'] <= token_count_threshold:
            # Check if the incoming dictionary's 'title' is empty and combine it with the prior dictionary
            if current_dict is not None and not dictionary['title']:
                current_dict['title'].extend(dictionary['title'])
                current_dict['token_count'] += dictionary['token_count']
                current_dict['text'] += dictionary['text']
            else:
                # Add the current dictionary and update its values
                if current_dict is None:
                    current_dict = dictionary.copy()
                else:
                    current_dict['title'].extend(dictionary['title'])
                    current_dict['token_count'] += dictionary['token_count']
                    current_dict['text'] += dictionary['text']
        else:
            # The current dictionary exceeds the threshold, so add it to the result list
            combined_dicts.append(current_dict)
            current_dict = dictionary.copy()  # Start a new current dictionary

    # Add the last remaining current dictionary, if any
    if current_dict:
        combined_dicts.append(current_dict)

    return combined_dicts


def process_epub_to_book_dict(epub_file):
    book = epub.read_epub(epub_file)
    encoding = tiktoken.get_encoding("cl100k_base")
    book_dict = {
        'title': book.get_metadata('DC', 'title')[0][0],
        'author': book.get_metadata('DC', 'creator')[0][0],
        'content': extract_chapters_from_epub(book),
        'token_count': len(encoding.encode(extract_text_from_epub(book)))
    }
    print(book_dict['title'])
    token_part_count = sum(c['token_count'] for c in book_dict['content'])
    p_coverage = float(token_part_count) / book_dict['token_count']
    print(f"- p coverage- {p_coverage:.2%}")
    book_dict['combined_items'] = combine_dicts_by_token_count(book_dict['content'], 5000, 14000)
    return book_dict


def book_dict_to_markdown(book_dict):
    output = {
        "parts": [],
        "type": "book",
        "title": book_dict['title'],
        "author": book_dict['author'],
        "short_description": "",
        "avg_rating": 0,
        "views": 0,
        "n_saves": 0,
        "tags": [],
        "saves": [],
        "ratings": [],
    }
    for i in range(len(book_dict['combined_items'])):
        c = book_dict['combined_items'][i]
        if len(c['title']) > 1:
            # print("Generating title...")
            max_retries = 10
            retry_count = 0
            while retry_count < max_retries:
                try:
                    completion = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {
                                "role": "system",
                                "content": "Given the following list of titles, produce one short title."
                            },
                            {
                                "role": "user",
                                "content": " ".join(list(set(c['title'])))
                            }])
                    break
                except TimeoutError as e:
                    print(f"Retry {retry_count+1}/{max_retries}: TimeoutError - {e}")
                    retry_count += 1
                    if retry_count < max_retries:
                        # Wait for some time before retrying (you can adjust the delay)
                        sleep(5)  # Sleep for 5 seconds before the next retry
                    else:
                        print("Max retries reached. Exiting.")
                except openai.error.Timeout as e:
                    print(f"Retry {retry_count+1}/{max_retries}: "
                          f"openai.error.timeout - {e}")
                    retry_count += 1
                    if retry_count < max_retries:
                        # Wait for some time before retrying (you can adjust the delay)
                        sleep(5)  # Sleep for 5 seconds before the next retry
                    else:
                        print("Max retries reached. Exiting.")
            title= completion.choices[0].message.content
        elif len(c['title']) == 1:
            title = c['title'][0]
        else:
            title = str(i)
        # print(f"- {title}")
        if title.lower() == "index":
            continue
        summary = summarize_string(c['text'])
        part_output = {
            "summary": summary,
            "title": title,
            # "text": c['text'],
        }
        output['parts'].append(part_output)
    return output
