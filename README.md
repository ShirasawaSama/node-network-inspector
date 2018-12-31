# Node Network Inspector

Debugging your Node.js network requests, and replay them.

## Usage

```bash
npm i network-inspector
```

## Start your app

```bash
node -r network-inspector/lib/open your-app.js
```

Or with environment variables:

```bash
INSPECTOR_PORT=8000 INSPECTOR_NO_LOG=true INSPECTOR_OPEN=false node -r network-inspector/lib/open your-app.js
```

### Files

- `network-inspector/lib/install`: Just hook request api.
- `network-inspector/lib/server`: Hook request api and start server.
- `network-inspector/lib/open`: Start server and open your browser.

## API

```typescript
import Inspector from 'network-inspector'

Inspector.install() // return event-bus
Inspector.startServer(23333/* port */, false/* noLog */, true/* open browser */) // return [http server, express instance, socket.io instance]
```

Or:

```typescript
import Inspector from 'network-inspector/lib/install'
import Inspector from 'network-inspector/lib/server'
import Inspector from 'network-inspector/lib/open'
```

## Author

[Shirasawa](https://github.com/ShirasawaSama)

### About `public/img/icons`

They were copied from [vscode-material-icon-theme](https://github.com/PKief/vscode-material-icon-theme).

License: [MIT](https://github.com/PKief/vscode-material-icon-theme/blob/master/LICENSE.md).

Thanks!

## License

[MIT](./LICENSE)
