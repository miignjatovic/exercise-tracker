import { Database } from 'sqlite-async'

export const getUserExerciseLogsController = async (req, res) => {
    // get params and query params
    const userId = req.params.id
    const { from, to, limit } = req.query
    let queryParams = [userId]
    
    // create sql with query params
    let dateFilter = ''
    if (from) {
        dateFilter += ' AND date >= ?'
        queryParams.push(from)
    }
    if (to) {
        dateFilter += ' AND date <= ?'
        queryParams.push(to)
    }

    try {
        const db = await Database.open('./exercise-tracker.db')

        // get user information from db
        const user = await db.get('SELECT id, username FROM users WHERE id = ?', userId)
        if (!user) {
            await db.close()
            return res.status(404).json({ error: 'User not found.' })
        }

        // get all exercise logs with filters. LIMIT set to -1 if no limit is passed witch returns the entire list of exercises
        const logs = await db.all(`SELECT id, description, duration, date FROM exercises WHERE userId = ?${dateFilter} LIMIT ?`, [...queryParams, limit || -1])

        // count total exercises
        const { totalExercises } = await db.get('SELECT COUNT(id) as totalExercises FROM exercises WHERE userId = ?')

        await db.close()

        // construct the response
        const response = {
            ...user,
            logs,
            count: totalExercises
        }

        res.json(response)
    } catch (err) {
        res.status(500).json({ error: 'Database error while getting logs.' })
    }
}
