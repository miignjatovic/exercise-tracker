import { Database } from 'sqlite-async'

const isValidDate = (date) => {
    const pattern = /^\d{4}-\d{2}-\d{2}$/
    if (!pattern.test(date)) return false

    const parsedDate = new Date(date)
    return parsedDate.toISOString().slice(0, 10) === date
}

export const createExerciseController = async (req, res) => {
    const userId = req.params.id

    // check if the user exists
    try {
        const db = await Database.open('./exercise-tracker.db')
        const user = await db.get('SELECT id, username FROM users WHERE id = ?', userId)
        if (!user) {
            await db.close()
            return res.status(404).json({ error: 'User not found.' })
        }
    } catch (err) {
        return res.status(500).json({ error: 'Database error' })
    }

    let { description, duration, date } = req.body
    // check date
    if (!date) date = new Date().toISOString().slice(0, 10)

    // check desc
    if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'Description is required. Description must be a string.' })
    }

    // cehck duration
    if (!duration || typeof +duration !== 'number' || +duration <= 0) {
        return res.status(400).json({ error: 'Duration is required. Duration must be grater than 0.' })
    }

    // check date
    if (!isValidDate(date)) {
        return res.status(400).json({ error: 'Invalid date. Expected format: YYYY-MM-DD' })
    }

    try {
        const db = await Database.open('./exercise-tracker.db')
        const sql = 'INSERT INTO exercises (userId, description, duration, date) VALUES (?,?,?,?)'
        const result = await db.run(sql, userId, description, duration, date)
        await db.close()

        return res.json({ userId, id: result.lastID, description, duration, date })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ error: 'Database error' })
    }
}
