import { isValidDate } from '../../utils/utils.js'

export const createExerciseController = async (req, res) => {
    const userId = req.params.id

    // check if the user exists
    try {
        const user = await req.db.get('SELECT id, username FROM users WHERE id = ?', userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found.' })
        }
    } catch (err) {
        return res.status(500).json({ error: 'Database error' })
    }

    let { description, duration, date } = req.body

    // check desc
    if (!description || typeof description !== 'string') {
        return res.status(400).json({ error: 'Description is required. Description must be a string.' })
    }

    // check duration
    if (duration === undefined || duration === '') {
        return res.status(400).json({ error: 'Duration is required.' })
    }
    if (typeof +duration !== 'number' || isNaN(+duration)) {
        return res.status(400).json({ error: 'Duration must be a number.' })
    }
    if (+duration <= 0) {
        return res.status(400).json({ error: 'Duration must be grater than 0.' })
    }

    // check date
    if (!date) {
        date = new Date().toISOString().slice(0, 10)
    }
    if (date && !isValidDate(date)) {
        return res.status(400).json({ error: 'Invalid date. Expected format: YYYY-MM-DD' })
    }

    try {
        const sql = 'INSERT INTO exercises (userId, description, duration, date) VALUES (?,?,?,?)'
        const result = await req.db.run(sql, userId, description, duration, date)

        return res.json({ userId, id: result.lastID, description, duration, date })
    } catch (err) {
        return res.status(500).json({ error: 'Database error' })
    }
}
