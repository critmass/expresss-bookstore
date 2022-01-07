"use strict";

const db = require("../db")
const Book = require("./book")

beforeAll( async () => {
    await db.query("DELETE FROM books")
    await db.query(`
                INSERT INTO books (
                    isbn,
                    amazon_url,
                    author,
                    language,
                    pages,
                    publisher,
                    title,
                    year
                )
                VALUES (
                    '0123456789',
                    'http://amazon.com/something',
                    'Some Guy',
                    'english',
                    100,
                    'Random Penguin',
                    'Great Book',
                    2021
                ),
                (
                    '1234567890',
                    'http://amazon.com/something_else',
                    'Some Other Guy',
                    'english',
                    101,
                    'Random Penguin',
                    'Okay Book',
                    2022
                )
    `)
})

beforeEach(async () => {
    await db.query("BEGIN")
})

afterEach(async () => {
    await db.query("ROLLBACK")
})

afterAll(async () => {
    await db.end()
})

describe("Book.findOne", () => {
    it("finds a book if given a valid isbn", async () => {
        const book = await Book.findOne("0123456789")

        expect(book.isbn).toBe('0123456789')
        expect(book.amazon_url).toBe('http://amazon.com/something')
        expect(book.author).toBe('Some Guy')
        expect(book.language).toBe('english')
        expect(book.pages).toBe(100)
        expect(book.publisher).toBe('Random Penguin')
        expect(book.title).toBe('Great Book')
        expect(book.year).toBe(2021)
    })
    it("should return an error object", async () => {
        try{
            await Book.findOne("0000000000")
        }
        catch(err) {
            expect(err.status).toBe(404)
        }
    })
})

describe("Book.findAll", () => {
    it("returns all the books in the system", async () => {
        const books = await Book.findAll()
        const book0keys = new Set(Object.keys(books[0]))

        expect(books instanceof Array).toBeTruthy()

        expect(book0keys.has('isbn')).toBeTruthy()
        expect(book0keys.has('amazon_url')).toBeTruthy()
        expect(book0keys.has('author')).toBeTruthy()
        expect(book0keys.has('language')).toBeTruthy()
        expect(book0keys.has('pages')).toBeTruthy()
        expect(book0keys.has('publisher')).toBeTruthy()
        expect(book0keys.has('title')).toBeTruthy()
        expect(book0keys.has('year')).toBeTruthy()
    })
})

describe("Book.create", () => {
    const newBook = {
        isbn:"0987654321",
        amazon_url:"http://amazon.com/new_book",
        author:"That One Guy",
        language:"Esperanto",
        pages:1000,
        publisher:"Random Peguin",
        title:"Saluton",
        year:2022
    }
    it("creates an entry in the database if given proper data", async () => {
        const book = await Book.create(newBook)

        expect(book.isbn).toBe(newBook.isbn)
        expect(book.amazon_url).toBe(newBook.amazon_url)
        expect(book.author).toBe(newBook.author)
        expect(book.language).toBe(newBook.language)
        expect(book.pages).toBe(newBook.pages)
        expect(book.publisher).toBe(newBook.publisher)
        expect(book.title).toBe(newBook.title)
        expect(book.year).toBe(newBook.year)
    })
    it("throws an error if the isbn is poorly formated", async () => {
        try {
            await Book.create({...newBook, isbn:5})
        } catch (error) {
            expect(error instanceof Error).toBeTruthy()
        }
    })
    it("throws an error if information is missing", async () => {
        try {
            await Book.create({isbn:"1010101010"})
        } catch (error) {
            expect(error instanceof Error).toBeTruthy()
        }
    })
})

describe("Book.update", () => {
    const updatedBook = {
        isbn: "0123456789",
        amazon_url: "http://amazon.com/new_book",
        author: "That One Guy",
        language: "Esperanto",
        pages: 1000,
        publisher: "Random Peguin",
        title: "Saluton",
        year: 2022
    }
    it("updates a book in the database", async () => {
        const book = await Book.update(updatedBook.isbn, updatedBook)

        expect(book.isbn).toBe(updatedBook.isbn)
        expect(book.amazon_url).toBe(updatedBook.amazon_url)
        expect(book.author).toBe(updatedBook.author)
        expect(book.language).toBe(updatedBook.language)
        expect(book.pages).toBe(updatedBook.pages)
        expect(book.publisher).toBe(updatedBook.publisher)
        expect(book.title).toBe(updatedBook.title)
        expect(book.year).toBe(updatedBook.year)
    })
    it("throws an error if information is missing", async () => {
        try {
            await Book.update(
                updatedBook.isbn,
                {amazon_url:updatedBook.amazon_url}
            )
        } catch (error) {
            expect()
        }
    })
})

describe("Book.remove", () => {
    const isbn = "0123456789"
    it("removes a book from the database", async () => {
        try {
            await Book.remove(isbn)
            await Book.findOne(isbn)
        } catch (error) {
            expect(error.status).toBe(404)
        }
    })
    it("throws an error if book is not in the database", async () => {
        try {
            await Book.remove("0000000000")
        } catch (error) {
            expect(error.status).toBe(404)
        }
    })
})