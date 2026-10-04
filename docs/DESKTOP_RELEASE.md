# INTERSTELLAR 桌面版

## 当前状态

桌面前端已完成构建，8 项更新状态/发布配置测试通过。新版深黑与铂金光学图标已生成 macOS ICNS、Windows ICO 及多尺寸 PNG。桌面版直接编译当前网页的 React 界面和同一套物理/渲染代码；它不是加载在线网页的壳。公式字体、兼容渲染 workers、模型说明都随程序打包，观察功能可离线运行。

**尚未生成或测试原生 DMG / EXE。** 当前环境是 Linux，没有 Rust、macOS SDK 或 Windows SDK。已配置 macOS/Windows GitHub Actions，但尚未在项目 GitHub 仓库运行。前端 ZIP 不属于安装包，也不能证明原生程序已通过测试。

## 安装与更新设计

| 平台 | 安装文件 | 安装方式 |
| --- | --- | --- |
| macOS 12+ / Apple Silicon 与 Intel | Universal `.dmg` | 拖到 Applications |
| Windows x64 | NSIS `-setup.exe` | 当前用户安装；缺失 WebView2 时联网下载运行时 |

实际兼容性仍需原生测试确认。WebGL2 及 GPU 驱动决定是否启用主渲染器；应用继续使用网页的 AUTO / HIGH / ULTRA 质量和诊断系统，没有另行降低渲染预算。

正式版本启动后 5 秒检查更新，此后每 6 小时检查一次。小型 APP UPDATES 按钮提供手动检查、版本说明、下载进度和安装/重启。更新需用户点击安装。Tauri 在安装之前验证更新签名；网络或签名失败不应重启应用。更新重启会重置当前观察，界面明确说明这一点。开发/测试构建没有已配置的发布频道，不假装能自动更新。

## 本地开发

安装平台所需 Rust/Tauri 依赖后，在项目根目录运行：

```sh
pnpm install --frozen-lockfile
npm --prefix desktop ci
npm --prefix desktop test
npm --prefix desktop run tauri -- dev
```

`npm --prefix desktop run build` 只构建离线前端，不生成安装包。原生命令应在 `desktop` 中执行；macOS 使用 `npm run tauri -- build --target universal-apple-darwin --bundles app,dmg`，Windows 使用 `npm run tauri -- build --target x86_64-pc-windows-msvc --bundles nsis`。

## 首次 GitHub 配置

1. 为项目建立独立的 **public** GitHub 仓库，上传完整项目根目录。公开 Releases 才能让没有 GitHub / ChatGPT 账号的用户直接下载和更新。不要覆盖无关仓库。
2. 运行 **Desktop build checks**。两个平台都构建安装文件并上传 Actions artifacts，首轮生成的 `desktop/src-tauri/Cargo.lock` 也被保留。取回其中一份 lockfile、确认两平台一致并提交；正式发布前固定 Rust 依赖。测试构建没有正式更新频道，Mac 采用 ad-hoc 签名。
3. 在自己的可信电脑上生成更新签名密钥：在 `desktop` 中运行 `npm run tauri -- signer generate --write-keys <自己的安全目录>/interstellar.key`。永久保存私钥和密码；后续版本需同一密钥。不要发送到聊天，不要提交进仓库。
4. GitHub 仓库 Settings → Secrets and variables → Actions：把 `.pub` 文件内容放进 variable `TAURI_UPDATER_PUBLIC_KEY`；私钥内容放进 secret `TAURI_SIGNING_PRIVATE_KEY`；私钥密码放进 secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`。
5. 配置下面的平台签名，再运行 **Signed desktop release draft**，输入稳定版本号，例如 `0.1.0`。脚本将该版本和真实公开更新地址嵌入程序，不写入私钥。

更新签名与系统代码签名不同。前者验证软件更新，后者用于操作系统的发行者信任。

### macOS 正式发行

需要自己的 Apple Developer ID Application 证书和 notarization 配置：

| GitHub 类型 | 名称 | 内容 |
| --- | --- | --- |
| Secret | `APPLE_CERTIFICATE` | Base64 编码的 Developer ID Application `.p12` |
| Secret | `APPLE_CERTIFICATE_PASSWORD` | `.p12` 密码 |
| Variable | `APPLE_SIGNING_IDENTITY` | 完整 Developer ID Application 身份名称 |
| Secret | `APPLE_ID` | Apple 开发者账号 |
| Secret | `APPLE_PASSWORD` | Apple 的 app-specific password |
| Variable | `APPLE_TEAM_ID` | Apple Team ID |

正式 Mac job 缺失上述配置时会失败，不生成一个假装已公证的包。使用 Apple API key 的账号可按 Tauri 官方说明调整凭证方式。

### Windows 正式发行

工作流支持在可用的证书提供方式下导入 `WINDOWS_CERTIFICATE`（Base64 PFX）和 `WINDOWS_CERTIFICATE_PASSWORD`（Secrets），自动取得 thumbprint，再由 Tauri 签名。现代商业证书可能需要硬件或云签名服务；这种情况应改用提供方的签名命令，不能用这套 PFX 导入代替。没有证书时可生成未 Authenticode 签名的测试安装包，下载和执行可能出现 Windows 信任提示。签名也不保证立即取得 SmartScreen 信誉。

## 交付前必须完成的真实测试

- macOS 与 Windows 都能安装、启动、卸载，图标及全屏正常；Mac `codesign`、`spctl` 与 notarization 通过。
- 无网络情况下观察六种天体；公式/说明、音频、摄影机、恢复出厂设置均可用。检查 WebView 原生控制台和 shader compile 状态。
- 实机比较网页与桌面画面；检查 AUTO 适应、原生像素、ULTRA 上限、近距离和窗口缩放。发布前以实际设备结果为准。
- `0.1.0 → 0.1.1` 的真实签名更新：自动发现、手动检查、下载、安装、重启、版本改变。另验证离线和错误签名；状态单元测试不能代替原生更新测试。
- 工作流 `channel-check` 核对 Universal Mac 两种架构与 Windows x64 的 `latest.json`、签名文件和下载完整性。通过不等于原生安装已验收。

两个平台都通过后再发布 release draft。公开发布使 `releases/latest/download/latest.json` 成为生效的自动更新频道。后续修改源代码、增加版本号、运行相同发布工作流并完成检查，即可把更新推送给已安装用户。

## 文件

- `desktop/assets/icon-source.png`：新版原始图标；品牌艺术标志，不是科学模拟截图。
- `desktop/src-tauri/icons/`：已转换的安装图标，包含 16–256 像素 ICO 与 Mac ICNS。
- `desktop/src/update-controller.ts`：检查、下载、错误和重启状态机。
- `desktop/src/main.tsx`：原生全屏、外部链接、模型文档和更新面板。
- `.github/workflows/desktop-build.yml`：原生构建验证。
- `.github/workflows/desktop-release.yml`：签名发行草稿及频道核对。

官方参考：[Tauri Updater](https://v2.tauri.app/plugin/updater/)、[Tauri GitHub Action](https://github.com/tauri-apps/tauri-action)、[macOS signing](https://v2.tauri.app/distribute/sign/macos/)、[Windows signing](https://v2.tauri.app/distribute/sign/windows/)。
