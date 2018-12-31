import { extension } from 'mime-types'
import { Component, Vue } from 'vue-property-decorator'
import { Buffer } from 'buffer'
import stringify from 'stringify-object'

const Worker = require('worker-loader!../worker')
const worker = new Worker()

interface Request {
  id: number
  icon: string
  name: string
  href: string
  request: any
  response: any
  status: number
  time: number
  headers: any
  method: string
  data: Buffer
  error: string
  nodeCode: { code: string, module: boolean, start: string }
  receiveData: Buffer
}

const NONE = Object.freeze({})

function formatObject (obj: any, i: { i: number }) {
  return Object.entries(obj).map(([title, v]: [string, any]) => {
    if (v == null || v === 0 || v === '' || (Array.isArray(v)
      ? !v.length : (typeof v === 'object' && !Object.keys(v).length))) return
    const o = v != null && typeof v === 'object'
    const data = { title, id: i.i++, name: o ? '' : String(v) } as any
    if (o) data.children = formatObject(v, i)
    return data
  }).filter(Boolean)
}

@Component({
  sockets: {
    linking (json) {
      const data = JSON.parse(json)
      const req = data.request
      const module = req.protocol.startsWith('https')
      const request = stringify(req, { indent: '  ', inlineCharacterLimit: 20 })
      const start = `require('${module ? 'https'
        : 'http'}').request(${request}, res => console.log(res.statusCode)).end(`
      this.$data.items.push({ ...data, status: 0, time: 0, request: Object.freeze(req), error: '',
        headers: Object.freeze(data.headers), data: Buffer.alloc(0), receiveData: Buffer.alloc(0),
        response: NONE, icon: '',
        nodeCode: { code: start + ')', module, start } })
    },
    linked (id, args, error: string) {
      const item = this.$data.items.find(i => i.id === id)
      if (args) {
        if (item) {
          item.status = 1
          item.response = Object.freeze(JSON.parse(args))
          const icon = extension(item.response.headers['content-type'])
          if (icon) item.icon = `${process.env.BASE_URL}img/icons/${icon}.svg`
        }
      } else {
        item.error = error
        item.status = 2
      }
    },
    linkEnd (id, time) {
      const item = this.$data.items.find(i => i.id === id)
      if (item) {
        item.status = 2
        item.time = time
      }
    },
    send (id, data: ArrayBuffer) {
      const item: Request = this.$data.items.find(i => i.id === id)
      if (item) {
        item.data = Buffer.concat([item.data, Buffer.from(data)])
        item.nodeCode.code = item.nodeCode.start + 'Buffer.from(' +
          stringify(item.data.toJSON().data, { indent: '  ', inlineCharacterLimit: Infinity }) + '))'
      }
    },
    receive (id, data) {
      const item: Request = this.$data.items.find(i => i.id === id)
      if (item) {
        item.receiveData = Buffer.concat([item.receiveData, Buffer.from(data)])
      }
    }
  }
})
export default class Requests extends Vue {
  public items: Request[] = []
  public treeData = [] as any
  public dialog = false
  public dataDialog = false
  public original = false
  public loading = false
  public snackbar = false
  public error = false
  public filter = ''
  public code = ''
  public FILE = `${process.env.BASE_URL}img/icons/file.svg`
  public showData = { formated: '', origin: '', originHL: '', formatedHL: '' }

  public openDialog (data: Request) {
    const { response: res } = data
    const result = [
      {
        id: 1,
        name: '基本信息:',
        children: [
          { id: 2, title: '地址', name: data.href },
          { id: 3, title: '方法', name: data.method },
          { id: 4, title: '状态值', name: (res.statusCode ? `${res.statusCode} ${res.statusMessage}`
            : '加载中...') },
          { id: 5, name: '请求对象:', children: formatObject(data.request, { i: 10000 }) }
        ]
      },
      {
        id: 20,
        name: '请求头:',
        children: Object.entries(data.headers).map(([title, name], i) => ({
          name,
          title,
          id: 20000 + i
        }))
      }
    ]
    if (res.statusCode) {
      result.push({
        id: 21,
        name: '返回头:',
        children: Object.entries(res.headers).map(([title, name], i) => ({
          name,
          title,
          id: 30000 + i
        }))
      })
    }
    this.treeData = result
    this.dialog = true
  }

  public async openDataDialog (buf: Buffer) {
    this.loading = true
    this.original = false
    this.dataDialog = true
    const str = buf.toString()
    worker.postMessage(str)
    const d = await new Promise(resolve => {
      const f = ({ data }) => {
        worker.removeEventListener('message', f)
        resolve(data)
      }
      worker.addEventListener('message', f)
    }) as any
    d.origin = str
    this.showData = d
    this.loading = false
  }

  public onCopy () {
    this.error = false
    this.snackbar = true
  }
  public onCopyError () {
    this.error = true
    this.snackbar = true
  }

  public replay (obj: any) {
    this.$socket.emit('replay', obj.nodeCode.module, obj.request, obj.data.toJSON().data)
  }
}
