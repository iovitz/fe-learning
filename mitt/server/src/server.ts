import Koa from 'koa'
import koaBody from 'koa-body'
import koaCros from 'koa2-cors'
import koaBodyparser from 'koa-bodyparser'
import appConfig from './config/app_config'
import { sequelize } from './model/mysql/mysql_connection'
import { rootRouter } from './utils/koa_request'
import { responseFormat } from './utils/middleware/response_format.middleware'
import './controller'
import { printer } from './utils/printer'

export class Server {
  private app = new Koa()
  constructor() {}

  async init() {
    try {
      await this.connectDatabase()

      this.initMiddleware()
      this.listen()
    } catch (e) {
      printer.error('数据库连接失败', e instanceof Error ? e.message : e)
    }
  }

  async connectDatabase() {
    await sequelize.authenticate()
    printer.success('数据库连接成功')
  }

  initMiddleware() {
    this.app.use(koaBodyparser())
    this.app.use(koaCros())
    this.app.use(responseFormat)
    this.app.use(rootRouter.routes())
    this.app.use(rootRouter.allowedMethods({}))
  }

  listen() {
    const port = appConfig.getConfig('app_port')

    this.app.listen(Number(port), () => {
      printer.success(`Server running in: http://localhost:${port}`)
    })
  }
}
