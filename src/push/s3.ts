import * as dayjs from "dayjs"
import * as AWS from "aws-sdk"

import { PushFunc } from "@/push"
import { LogLevel } from "@/type/config"
import { getLogger } from "@/log"

/**
 * S3推送功能实现
 * 将日志消息推送到S3协议兼容的对象存储服务
 * @param level 日志级别
 * @param args 日志消息参数
 * @returns Promise
 */
export const s3: PushFunc = async (level: LogLevel, ...args: string[]) => {
    return new Promise((resolve, reject) => {
        const logger = getLogger()
        try {
            // 检查S3推送是否启用
            const s3Config = global.config.StreamerHelper.push.s3
            if (!s3Config || !s3Config.enable) {
                logger.debug('S3推送未启用，跳过执行')
                resolve(true)
                return
            }
            
            // 检查必要的配置参数
            if (!s3Config.endpoint || !s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucket) {
                logger.error('S3推送配置不完整，缺少必要参数')
                resolve(false)
                return
            }
            
            // 创建S3客户端
            const s3Client = new AWS.S3({
                endpoint: s3Config.endpoint,
                accessKeyId: s3Config.accessKeyId,
                secretAccessKey: s3Config.secretAccessKey,
                region: s3Config.region || 'us-east-1',
                s3ForcePathStyle: true, // 使用路径风格访问
                signatureVersion: 'v4'
            })

            const msg = args.join(";")
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
            const prefix = s3Config.prefix || 'logs/streamerhelper'
            const key = `${prefix}/${level}_${timestamp}.txt`
            
            // 构建日志内容
            const content = `告警信息: ${msg}\n级别: ${level}\n时间: ${dayjs().format()}`
            
            logger.debug(`正在推送 ${level} 级别日志到 S3: ${s3Config.bucket}/${key}`)
            
            // 上传到S3
            s3Client.putObject({
                Bucket: s3Config.bucket,
                Key: key,
                Body: content,
                ContentType: 'text/plain'
            }, (err) => {
                if (err) {
                    logger.error(`推送到 S3 失败: ${err}`)
                    reject(err)
                } else {
                    logger.info(`成功推送 ${level} 级别日志到 S3`)
                    resolve(true)
                }
            })
        } catch (err) {
            logger.error(`S3推送执行异常: ${err}`)
            reject(err)
        }
    })
}