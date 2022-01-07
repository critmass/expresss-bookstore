"use strict";

const request = require("supertest")

const {create} = require("../models/book")
const resetDB = require("../_resetDB")
const app = require("../app")
const db = require("../db")

const book1 = {
    isbn: "0123456789",
    amazon_url: "http://amazon.com/book1",
    author: "That One Guy",
    language: "Esperanto",
    pages: 1000,
    publisher: "Random Peguin",
    title: "Saluton",
    year: 2022
}
const book2 = {
    isbn: "0987654321",
    amazon_url: "http://amazon.com/book2",
    author: "Some One",
    language: "English",
    pages: 421,
    publisher: "Random Peguin",
    title: "Hello",
    year: 2021
}

beforeAll(async () => {
    await resetDB()
    await create(book1)
    await create(book2)
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

describe("GET /books", () => {
    it("returns all the books in the database", async () => {
        const resp = await request(app).get("/books")

        expect(resp.status).toBe(200)
        expect(resp.body.books.find(
            book => book.isbn === book1.isbn
        )).toEqual(book1)
    })
})

describe("GET /books/[isbn]", () => {
    it("returns a book based in an isbn", async () => {
        const resp = await request(app).get(`/books/${book1.isbn}`)

        expect(resp.status).toBe(200)
        expect(resp.body.book).toEqual(book1)
    })
    it("returns a 404 error if book not in database", async () => {
        const resp = await request(app).get(`/books/0000000000`)

        expect(resp.status).toBe(404)
    })
})

describe("POST /books", () => {
    const newBook = {
        isbn: "1010101010",
        amazon_url: "http://amazon.com/new_book",
        author: "Another One",
        language: "English",
        pages: 555,
        publisher: "Random Peguin",
        title: "New Book",
        year: 2022
    }
    it("returns the value of the book that is added to the database", async () => {
        const resp = await request(app)
                                .post("/books")
                                .send(newBook)

        expect(resp.status).toBe(201)
        expect(resp.body.book).toEqual(newBook)
    })
    it("returns 405 if data is poorly formed", async () => {
        const resp = await request(app)
                                .post('/books')
                                .send({isbn:"1357924680"})

        expect(resp.status).toBe(405)
    })
})

describe("PUT /books/[isbn]", () => {

    const newBook = {
        amazon_url: "http://amazon.com/new_book",
        author: "Another One",
        language: "English",
        pages: 555,
        publisher: "Random Peguin",
        title: "New Book",
        year: 2022
    }
    it("returns book when you update the database", async () => {
        const resp = await request(app)
                            .put(`/books/${book1.isbn}`)
                            .send(newBook)

        expect(resp.body.book).toEqual({...newBook, isbn:book1.isbn})
    })
    it("returns 405 status code when sent incomplete data", async () => {
        const resp = await request(app).put(`/books/${book1.isbn}`).send({
            amazon_url:"http://amazon.com/newest_book"
        })
        expect(resp.status).toBe(405)
    })
})

describe("DELETE /books/[isbn]", () => {
    it("removes a book from the database and returns a message saying so", async () => {
        const resp = await request(app).delete(`/books/${book1.isbn}`)
        expect(resp.status).toBe(200)
        expect(resp.body.message).toBe("Book deleted")

        const resp2 = await request(app).get(`/books/${book1.isbn}`)
        expect(resp2.status).toBe(404)
    })
    it("returns a 404 error if book not in database", async () => {
        const resp = await request(app).delete("/books/0000000000")
        expect(resp.status).toBe(404)
    })
})