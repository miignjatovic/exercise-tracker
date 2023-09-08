import request from 'supertest'
import { Database } from 'sqlite-async'

import app from '../../index'

jest.mock('sqlite-async')

const mockUser = { id: 1, username: 'testUser' }
const mockExercise = { id: 1, description: 'test exercise', duration: 30 }
const mockLogs = [mockExercise]

describe('Root route', () => {
    it('should have a GET method for the root route', async () => {
        const resp = await request(app).get('/')
        expect(resp.statusCode).toEqual(200)
    })
})

describe('Logs Router', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return 404 if user not found', async () => {
        Database.open.mockResolvedValue({
            get: jest.fn().mockResolvedValue(null),
            close: jest.fn()
        })

        const res = await request(app).get('/api/users/1/logs')
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: 'User not found.' })
    })

    it('should return logs for a user', async () => {
        
        Database.open.mockResolvedValue({
            get: jest.fn()
                .mockResolvedValueOnce(mockUser)
                .mockResolvedValueOnce({ totalExercises: 1 }),
            all: jest.fn().mockResolvedValue(mockLogs),
            close: jest.fn()
        })

        const res = await request(app).get('/api/users/1/logs')
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            ...mockUser,
            logs: mockLogs,
            count: 1
        })
    })

    it('should return 500 if there is a database error', async () => {
        Database.open.mockRejectedValue(new Error('DB error'))

        const res = await request(app).get('/api/users/1/logs')
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ error: 'Database error while getting logs.' })
    })
})


describe('Exercise Router', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should return 404 if user not found', async () => {
        Database.open.mockResolvedValue({
            get: jest.fn().mockResolvedValue(null),
            close: jest.fn()
        })

        const res = await request(app).post('/api/users/1/exercises').send(mockExercise)
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: 'User not found.' })
    })

    it('should create an exercise for a user', async () => {
        const mockUser = { id: 1, username: 'testUser' }
        
        Database.open.mockResolvedValue({
            get: jest.fn().mockResolvedValue(mockUser),
            run: jest.fn().mockResolvedValue({ lastID: 1 }),
            close: jest.fn()
        })

        const res = await request(app).post('/api/users/1/exercises').send(mockExercise)
        expect(res.status).toBe(200)
        expect(res.body).toEqual({
            userId: '1',
            ...mockExercise,
            date: expect.any(String) // test for dynamic date
        })
    })

    it('should return 400 for invalid input data', async () => {
        const res = await request(app).post('/api/users/1/exercises').send({ description: '', duration: -1 })
        expect(res.status).toBe(400)
    })

    it('should return 500 if there is a database error', async () => {
        Database.open.mockRejectedValue(new Error('DB error'))

        const res = await request(app).post('/api/users/1/exercises').send(mockExercise)
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ error: 'Database error' })
    })
})

describe('Users Router', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should create a user', async () => {
        Database.open.mockResolvedValue({
            run: jest.fn().mockResolvedValue({ lastID: 1 }),
            close: jest.fn()
        })

        const res = await request(app).post('/api/users').send({ username: mockUser.username })
        expect(res.status).toBe(200)
        expect(res.body).toEqual({ ...mockUser })
    })

    it('should return 400 for invalid username', async () => {
        const res = await request(app).post('/api/users').send({ username: 't@' })
        expect(res.status).toBe(400)
    })

    it('should return 409 for duplicate username', async () => {
        Database.open.mockResolvedValue({
            run: jest.fn().mockRejectedValue({ errno: 19 }),
            close: jest.fn()
        })

        const res = await request(app).post('/api/users').send({ username: mockUser.username })
        expect(res.status).toBe(409)
        expect(res.body).toEqual({ error: 'Username must be unique.' })
    })

    it('should return 500 if there is a database error during user creation', async () => {
        Database.open.mockRejectedValue(new Error('DB error'))

        const res = await request(app).post('/api/users').send({ username: mockUser.username })
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ error: 'Database error. Could not create new user.' })
    })

    it('should get all users', async () => {
        const mockUsers = [mockUser]
        
        Database.open.mockResolvedValue({
            all: jest.fn().mockResolvedValue(mockUsers),
            close: jest.fn()
        })

        const res = await request(app).get('/api/users')
        expect(res.status).toBe(200)
        expect(res.body).toEqual(mockUsers)
    })

    it('should return 404 if no users found', async () => {
        Database.open.mockResolvedValue({
            all: jest.fn().mockResolvedValue([]),
            close: jest.fn()
        })

        const res = await request(app).get('/api/users')
        expect(res.status).toBe(404)
        expect(res.body).toEqual({ error: 'No users found.' })
    })

    it('should return 500 if there is a database error during fetching users', async () => {
        Database.open.mockRejectedValue(new Error('DB error'))

        const res = await request(app).get('/api/users')
        expect(res.status).toBe(500)
        expect(res.body).toEqual({ error: 'Database error. Could not get all users.' })
    })
})