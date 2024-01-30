# Book Club

## Description

An app for sharing summaries of ebooks and journal articles.

### Ideas

- [ ] if a user is checking out a book they didn't create, pop up a modal
  shaming them into buying it if they got value out of it.
- [ ] a user can be authorized for books, articles, admin, or all

## Databases

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
`books_checked_out` : list of objects - book id, title, author, date checked out
`books_created` : list of objects - book ids, title, author, date created
`articles_checked_out` : list of objects - article ids, title, author, 
journal, date checked out
`articles_created` : list of objects - article id, title, author, journal, date created



## Functions 

### Add epub

### Add pdf

## Components

### Login :Complete
- Google only

### Register: In Progress
- Add name is the one in Google isn't accurate

### Admin
- Display all users not verified - with button to verify or ignore

### Navbar
- Find new stuff - redirect to browse page
- My Stuff - page of stuff checked out and created
- Admin page if user is an admin - page for authorizing new users
- Logout

### Browse
- two tabs - books and articles

### Footer

### Books
- Display all books 'organized' some how
- v2 - sort by new / most popular / search
- List books, button to check out - button will add book_id in firebase

### Articles
- Display all articles 'organized' some how
- v2 - sort by new / most popular / search