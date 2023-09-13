import { isValidDate } from '../../utils/utils.js'

export const getUserExerciseLogsController = async (req, res) => {
    // get params and query params
    const userId = req.params.id
    let { from, to, limit } = req.query
    let queryParams = [userId]
    
    // create sql with query params
    let dateFilter = ''
    // check from to
    let fromToErrors = []
    if (from) {
        if (isValidDate(from)) {
            dateFilter += ' AND date >= ?'
            queryParams.push(from)
        } else {
            fromToErrors.push('from')
        }
    }
    if (to) {
        if (isValidDate(to)) {
            dateFilter += ' AND date <= ?'
            queryParams.push(to)
        } else {
            fromToErrors.push('to')
        }
    }
    if (fromToErrors.length) {
        return res.status(400).json({ error: `Invalid ${fromToErrors.length > 1 ? fromToErrors.join(' and ') : fromToErrors[0]} qurry param. Expected format: YYYY-MM-DD` })
    }

    // check limit
    if (limit) {
        if (typeof +limit === 'number' && !isNaN(+limit) && +limit % 1 === 0 && limit > 0) {
            limit = limit
        } else {
            return res.status(400).json({ error: 'Invalid to limit qurry param. Must be a whole number greater than 0.' })
        }
    }

    try {
        // get user information from db
        const user = await req.db.get('SELECT id, username FROM users WHERE id = ?', userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found.' })
        }

        // get all exercise logs with filters. LIMIT set to -1 if no limit is passed witch returns the entire list of exercises
        // order by date ASC to get the latest exercises
        const logs = await req.db.all(`SELECT id, description, duration, date FROM exercises WHERE userId = ?${dateFilter} ORDER BY date ASC LIMIT ?`, [...queryParams, limit || -1])

        // count total exercises and add from and to filter if querry params are present
        const { totalExercises } = await req.db.get(`SELECT COUNT(id) as totalExercises FROM exercises WHERE userId = ?${dateFilter}`, queryParams);

        // construct the response
        const response = {
            ...user,
            logs,
            count: totalExercises
        }

        return res.json(response)
    } catch (err) {
        return res.status(500).json({ error: 'Database error while getting logs.' })
    }
}
