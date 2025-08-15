import { log4js } from "@/log/config";
import { pushMsg } from "@/push";
import { LogLevel } from "@/type/config";
import { io } from "@/http";
import { broadcastLog as wsBroadcastLog } from "@/http/websocket";

// log4js/lib/levels.js
const ALL_VALUE = Number.MIN_VALUE,
    TRACE = 5000,
    DEBUG = 10000,
    INFO = 20000,
    WARN = 30000,
    ERROR = 40000,
    FATAL = 50000,
    MARK = 9007199254740992,
    OFF = Number.MAX_VALUE


const levels: { [key in LogLevel]: any } = {
    ALL: { value: ALL_VALUE, colour: 'grey' },
    TRACE: { value: TRACE, colour: 'blue' },
    DEBUG: { value: DEBUG, colour: 'cyan' },
    INFO: { value: INFO, colour: 'green' },
    WARN: { value: WARN, colour: 'yellow' },
    ERROR: { value: ERROR, colour: 'red' },
    FATAL: { value: FATAL, colour: 'magenta' },
    MARK: { value: MARK, colour: 'grey' }, // 2^53
    OFF: { value: OFF, colour: 'grey' }
}

const levelStrs = Object.keys(levels)
const levelStr = global.config.StreamerHelper.logLevel.toUpperCase() as LogLevel
const levelVal = levels[levelStr].value

export function getExtendedLogger(category?: string | undefined): log4js.Logger {
    return extend(log4js.getLogger(category), extendHandler)
}

/**
 * 通过WebSocket广播日志消息
 * @param level 日志级别
 * @param args 日志内容
 */
export function broadcastLog(level: LogLevel, ...args: string[]) {
    // 确保io已初始化
    if (io) {
        const message = args.join(' ');
        wsBroadcastLog(io, { 
            level, 
            message,
            timestamp: new Date().toISOString() 
        });
    }
}

export function getLogger(category?: string): log4js.Logger {
    return log4js.getLogger(category)
}

const extendHandler: ProxyHandler<log4js.Logger> = {
    get: function (obj: any, prop) {
        const propStr = prop.toString().toUpperCase()

        // Methods other than logger.<level>
        if (levelStrs.indexOf(propStr) == -1) {
            return obj[prop]
        }

        const level = levels[propStr as LogLevel]
        const ori = obj[prop]

        return (...args: string[]) => {

            if (level && level.value >= levelVal) {
                process.nextTick(() => {
                    // 发送推送消息
                    pushMsg(propStr as LogLevel, ...args);
                    // 广播日志消息
                    broadcastLog(propStr as LogLevel, ...args);
                });
            }

            return ori.apply(obj, args)

        }

    }
}

function extend<T extends object>(logger: T, extendHandler: ProxyHandler<T>) {
    return new Proxy<T>(logger, extendHandler)
}