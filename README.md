# @ifgeny87/webxuker


## Docs

- [DEVNOTES.md](docs%2FDEVNOTES.md)


## Description

Сервис принимает запросы по http, сверяет запрос по конфигу и выполняет команды из конфига.


## Installation

### 1. Installation with inner CLI tool

Install xuker CLI:

```shell
npm i -g @ifgeny87/xukercli
```

Install Webxuker application:

```shell
xuker install [--path /opt/webxuker]
```

Update Webxuker version:

```shell
xuker update
```

Create new service:

```shell
xuker service create NAME CONFIG_PATH
```

More information about CLI tool you can see on [https://www.npmjs.com/package/@ifgeny87/xukercli](https://www.npmjs.com/package/@ifgeny87/xukercli)


### 2. Installation with gh util

Installation gh example:

```shell
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg && \
chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null && \
apt update && \
apt install gh -y
```

Copying release candidate from gh. You need environment variables:

- `RELEASE` - release candidate version, the same as tag

```shell
export RELEASE=<release version code> && \
gh release download $RELEASE -R git@github.com:ifgeny87/webxuker -O webxuker.$RELEASE.tgz -p "*.tgz" && \
tar -zxvf webxuker.$RELEASE.tgz -C ./ && \
rm webxuker.$RELEASE.tgz && \
mv ./package/* ./ && \
rm -r ./package
```

Install production node modules:

```shell
npm ci --omit=dev && \
npm config set fund false -g && \
npm set audit false -g && \
npm i -g npm@latest && \
npm i -g bunyan
```

Configure your new Webxuker service:

> // TODO

Start with Node:

```shell
node webxuker.js --cfg=config.yaml
```
