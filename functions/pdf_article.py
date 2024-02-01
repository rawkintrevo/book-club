import fitz  # PyMuPDF
import openai
import tiktoken


def is_main_content(llm_response):
    # Placeholder for logic to determine if LLM response indicates end of main content
    # This could be based on keywords, sentiment, or any other criteria you define
    return "end of main content" not in llm_response


def analyze_text_chunk(text_chunk):
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
    print(llm_response)
    return is_main_content(llm_response)


def extract_main_content(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    chunk_size = 2  # Number of pages to read at a time

    for start_page in range(0, len(doc), chunk_size):
        text_chunk = ""
        end_page = min(start_page + chunk_size, len(doc))
        print(start_page, end_page)
        for page_num in range(start_page, end_page):
            page = doc.load_page(page_num)
            text_chunk += page.get_text()

        # Putting this before the break ensures the last slug of text is included.
        full_text += text_chunk

        if not analyze_text_chunk(text_chunk):
            break  # Exit loop if LLM determines end of main content reached
    doc.close()
    return full_text

