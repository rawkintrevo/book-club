# Book Club

## Description

An app for sharing summaries of ebooks and journal articles.

## Main Page

- Recently Created
- Most Popular
- My Stuff

### Content Database
`parts` : list of objects
  - `type` : string - 'book' or 'article'
  - `content_summary` : string - summary of part
  - `title` : string - title of part
  - `original_content` : string - original content
`id` : string - uid
`created` : date
`title` : string
`author` : string
`short_description` : string
`avg_rating` : float
`times_checked_out` : int
`tags` : list of strings
`s3` : string - url to s3 bucket

### User Database

`name` : string
`id` : string - uid
`email` : string
`verified` : bool
`books_checked_out` : list of strings - book ids
`books_created` : list of strings - book ids
`articles_checked_out` : list of strings - article ids
`articles_created` : list of strings - article ids



## Functions 

### Add epub

### Add pdf

## Components

### Login
- Google only

### Register
- Add name is the one in Google isn't accurate

### Admin
- Display all users not verified - with button to verify or ignore

### Navbar
- Find new stuff
- My Stuff
- Admin page if user is an admin

### Footer

### Books
- Display all books 'organized' some how
- v2 - sort by new / most popular / search
- List books, button to check out - button will add book_id in firebase

### Articles
- Display all articles 'organized' some how
- v2 - sort by new / most popular / search