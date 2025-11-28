import { treaty } from '@elysiajs/eden'
import type { App } from '../../../../backend/src/index'

const APIClient = treaty<App>('localhost:3001')

export default APIClient
