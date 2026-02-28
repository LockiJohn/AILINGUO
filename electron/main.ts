import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { initDatabase } from './db/database'
import { registerLessonHandlers } from './ipc/lesson'
import { registerProgressHandlers } from './ipc/progress'
import { registerContentHandlers } from './ipc/content'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow(): BrowserWindow {
    const win = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 900,
        minHeight: 640,
        backgroundColor: '#0f0f14',
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0f0f14',
            symbolColor: '#a0a0b0',
            height: 32,
        },
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
        icon: join(__dirname, '../assets/icon.png'),
        show: false,
    })

    win.once('ready-to-show', () => {
        win.show()
    })

    if (isDev) {
        win.loadURL('http://localhost:5173')
        win.webContents.openDevTools()
    } else {
        win.loadFile(join(__dirname, '../dist/index.html'))
    }

    // Open external links in default browser
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })

    return win
}

app.whenReady().then(async () => {
    // Initialize SQLite database
    const db = initDatabase()

    // Register IPC handlers
    registerLessonHandlers(ipcMain, db)
    registerProgressHandlers(ipcMain, db)
    registerContentHandlers(ipcMain, db)

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
