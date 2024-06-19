# Development notes


## Dev

Simple launch script to check services:

```shell
nx run-many -t serve -p webxuker
```

To display the logs of running services that run under the control of the PM2, run this:

```shell
pm2 logs --raw | bunyan
```

Start in debugging mode:

```shell
npm run dev 
```


## Building

1. Lint all

```shell
nx lint
```

2. Test libs 

```shell
nx test commonlib
```

3. Build selected

```shell
nx run-many -t build -p webxuker
```

4. Build affected

```shell
nx affected -t build
```

5. Build and release new version

Personal Access Tokens -- https://github.com/settings/tokens

```shell
GH_TOKEN=<pat> nx release
```
