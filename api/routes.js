import { Router } from 'express'
import { getAllUsersController, createUserController } from './controllers/users.controller.js'
import { createExerciseController } from './controllers/exercises.controller.js'
import { getUserExerciseLogsController } from './controllers/logs.controller.js'

const router = Router()

router
    .route('/users')
    .get(getAllUsersController)
    .post(createUserController)

router
    .route('/users/:id/exercises')
    .post(createExerciseController)

router
    .route('/users/:id/logs')
    .get(getUserExerciseLogsController)

export default router