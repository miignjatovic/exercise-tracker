// Create a database connection
import { Database } from 'sqlite-async'

export const openDbConnection = () => {
    return Database.open('./exercise-tracker.db')
}

export const useDb = (db) => (req, res, next) => {
    req.db = db
    next()
}

// Close the database connection on application termination
export const closeDbConnection = (db) => {
    process.on('SIGINT', async () => {
        await db.close()
        process.exit(0)
    })
    process.on('SIGTERM', async () => {
        await db.close()
        process.exit(0)
    })
}