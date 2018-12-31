import Express from 'express'
import * as ISocketIO from 'socket.io'
import opn from 'opn'
import stringify from 'fast-safe-stringify'
import { EventEmitter } from 'events'
import { getPortPromise } from 'portfinder'
import { parse, format } from 'url'
import { inherits } from 'util'
import { IncomingMessage, Server } from 'http'

function urlToOptions (url: URL) {
  const options = {
    protocol: url.protocol,
    hostname: url.hostname.startsWith('[') ?
      url.hostname.slice(1, -1) :
      url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname}${url.search}`,
    href: url.href
  } as any
  if (url.port !== '') {
    options.port = Number(url.port)
  }
  if (url.username || url.password) {
    options.auth = `${url.username}:${url.password}`
  }
  return options
}

const r = require('_http_client')
const Client = r.ClientRequest
const { write, end } = Client.prototype
const searchParamsSymbol = Symbol.for('query')
const event = new EventEmitter()
let isInstalled = false
let isStarted = false
let app: Express.Express
let server: Server
let socket: SocketIO.Namespace
const NOPE = () => {}

export default {
  isInstalled: () => isInstalled,
  install () {
    if (isInstalled) return event
    r.ClientRequest = function ClientRequest (input: any, options: any, cb?: any) {
      if (typeof input === 'string') {
        const urlStr = input
        try {
          input = urlToOptions(new URL(urlStr))
        } catch (err) {
          input = parse(urlStr)
          if (!input.hostname) throw err
        }
      } else if (input && input[searchParamsSymbol] && input[searchParamsSymbol][searchParamsSymbol]) {
        input = urlToOptions(input)
      } else {
        cb = options
        options = input
        input = null
      }

      if (typeof options === 'function') {
        cb = options
        options = input || {}
      } else {
        options = Object.assign(input || {}, options)
      }

      const { nativeProtocols: _, ...opts } = options
      const href = format(opts)
      const id = Date.now()
      let error: Error | undefined
      try {
        Client.call(this, options, (res: IncomingMessage) => {
          const { headers, httpVersion, statusCode = 500, statusMessage } = res
          event.emit('linked', id, null, { headers, httpVersion, statusCode, statusMessage })
          res.on('data', d => event.emit('receive', id, d))
          if (typeof cb === 'function') cb(res)
        })
      } catch (e) {
        error = e
      }
      event.emit('linking', id, { request: opts,
        headers: this.getHeaders(), method: this.method, id, href, name: parse(href).pathname })

      const handle = (d: string | Buffer) => event.emit('send', id, d)
      this.once('close', () => event.emit('linkEnd', id, Date.now()))
      this.write = (...args: any[]) => (args[0] && handle(args[0]), write.apply(this, args))
      this.end = (...args: any[]) => (args[0] && handle(args[0]), end.apply(this, args))
      if (error) {
        event.emit('linked', id, error)
        throw error
      }
    }
    inherits(r.ClientRequest, Client)
    isInstalled = true
    return event
  },
  async startServer (defaultPort?: number, noLog = false, open = false):
    Promise<[Server, Express.Express, SocketIO.Namespace]> {
    if (isStarted) return [server, app, socket]
    open = open || !!process.env.INSPECTOR_OPEN || !!process.env.NPM_CONFIG_INSPECTOR_OPEN
    noLog = noLog || !!process.env.INSPECTOR_NO_LOG || !!process.env.NPM_CONFIG_INSPECTOR_NO_LOG
    let port: any = defaultPort || process.env.INSPECTOR_PORT || process.env.NPM_CONFIG_INSPECTOR_PORT
    if (port) port = Number.parseInt(port, 10)
    if (!port || Number.isNaN(port) || port < 1 || port > 65536) port = 23333

    this.install()
    const { createServer } = require('http')
    const express: typeof Express = require('express')
    const root = require('path').join(__dirname, '../dist')

    app = express()
      .use(express.static(root))
      .use(require('express-history-api-fallback')('index.html', { root }))

    server = createServer(app)

    socket = (require('socket.io')() as ISocketIO.Server)
      .listen(server)
      .on('connection', io => io
        .on('replay', (name: boolean, request: number[], data: any) => {
          try {
            require(name ? 'https' : 'http')
              .request(request)
              .end(Buffer.from(data))
              .once('error', noLog ? NOPE : console.error)
          } catch (e) { if (!noLog) console.error(e) }
        })
      )

    port = await getPortPromise({ port })
    await new Promise((resolve, reject) => server.listen(port, resolve).once('error', reject))
    const url = `http://127.0.0.1:${port}/`
    if (!noLog) {
      console.log('\n\n\u001b[33mNode-Network-Inspector has been installed! \u001b[34mPort: ' +
        port + '\n\u001b[32mYou can use the browser to open this link to view the list of requests: \n' +
        '\u001b[34m' + url + '\n\n\u001b[0m')
    }
    server.on('error', noLog ? NOPE : console.error)
    event
      .on('linked', (id, err, obj?) => socket.emit('linked', id, obj && stringify(obj), err && err.message))
      .on('receive', (id, d) => socket.emit('receive', id, d))
      .on('linking', (_, obj) => socket.emit('linking', stringify(obj)))
      .on('send', (id, d) => socket.emit('send', id, d))
      .on('linkEnd', (id, t) => socket.emit('linkEnd', id, t))
    isStarted = true
    if (open) await opn(url)
    return [server, app, socket]
  },
  getEventBus: () => event,
  isStarted: () => isStarted,
  getServer: (): Server | undefined => server,
  getExpress: (): Express.Express | undefined => app,
  getSocketIO: (): SocketIO.Namespace | undefined => socket
}
