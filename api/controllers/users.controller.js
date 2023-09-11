import { Database } from 'sqlite-async'

export const createUserController = async (req, res) => {
    const { username } = req.body

    // check if username exists
    if (!username) {
        return res.status(400).json({ error: 'Username is required.' })
    }

    // length check
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username should be between 3 and 20 characters.' })
    }

    // alphanumeric check
    const alphanumeric = /^[a-z0-9]+$/i
    if (!alphanumeric.test(username)) {
        return res.status(400).json({ error: 'Username can only contain letters and numbers.' })
    }

    // no leading or trailing spaces
    if (username !== username.trim()) {
        return res.status(400).json({ error: 'Username should not start or end with spaces.' })
    }

    try {
        const db = await Database.open('./exercise-tracker.db')
        const sql = 'INSERT INTO users (username) VALUES (?)'
        const result = await db.run(sql, username)
        await db.close()

        return res.json({ id: result.lastID, username })
    } catch (err) {
        if (err.errno === 19) return res.status(409).json({ error: 'Username must be unique.' })
        return res.status(500).json({ error: 'Database error. Could not create new user.' })
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const db = await Database.open('./exercise-tracker.db')
        const sql = 'SELECT id, username FROM users'
        const users = await db.all(sql)
        await db.close()
        
        if (!users.length) return res.status(404).json({ error: 'No users found.' })

        return res.json(users)
    } catch (err) {
        return res.status(500).json({ error: 'Database error. Could not get all users.' })
    }
}
