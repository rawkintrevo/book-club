# Book Club

## Description

An app for sharing summaries of ebooks and journal articles.

### Ideas

- [ ] if a user is checking out a book they didn't create, pop up a modal
  shaming them into buying it if they got value out of it.
- [ ] a user can be authorized for books, articles, admin, or all
- [ ] a 'reset progress' button for books and articles, removes `read` tags 
  (for when you want to read it again, but not in one sitting)
- [ ] 'next' button on multi-part content - ie always there unless its the 
  final part of a book or article (which solves for one part articles)

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

`displayName` : string
`verifName` : string
`aoe` : string - area of expertise- 
`id` : string - uid
`email` : string
`photoURL` : string
`reviewed` : bool
`verifBooks` : bool
`verifArticles` : bool
`verifAdmin` : bool
`books` :
- `checked_out` : list of objects - book id, title, author, date checked out
- `created` : list of objects - book ids, title, author, date created
- `read` : list of objects - book id, title, author, date read
- `rated` : list of objects - book id, title, author, rating
- `books` :
`articles` :  
- `checked_out` : list of objects - book id, title, author, date checked out
- `created` : list of objects - book ids, title, author, date created
- `read` : list of objects - book id, title, author, date read
- `rated` : list of objects - book id, title, author, rating



## Functions 

### Add epub

### Add pdf

## Components

### Login :Complete
- Google only

### Register: Complete
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
- v2 - sort by new / most views / most popular / search
- List books, button to check out - button will add book_id in firebase

### Articles
- Display all articles 'organized' some how
- v2 - sort by new / most views / most popular / search
