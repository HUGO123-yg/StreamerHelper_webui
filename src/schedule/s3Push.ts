import * as fs from 'fs'
import * as path from 'path'
import * as AWS from 'aws-sdk'
import * as dayjs from 'dayjs'

import { getExtendedLogger } from '@/log'
import { Scheduler } from '@/type/scheduler'

/**
 * S3定时推送任务
 * 每小时将日志文件上传到S3兼容的对象存储服务
 */
const s3PushScheduler = new Scheduler(3600000, async () => {
    const logger = getExtendedLogger('S3PushScheduler')
    
    try {
        // 检查S3推送是否启用
        const s3Config = global.config.StreamerHelper.push.s3
        if (!s3Config || !s3Config.enable) {
            logger.debug('S3定时推送未启用，跳过执行')
            return
        }
        
        // 检查必要的配置参数
        if (!s3Config.endpoint || !s3Config.accessKeyId || !s3Config.secretAccessKey || !s3Config.bucket) {
            logger.error('S3推送配置不完整，缺少必要参数')
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
        
        // 获取日志目录
        const logDir = path.join(process.cwd(), 'logs')
        if (!fs.existsSync(logDir)) {
            logger.warn(`日志目录不存在: ${logDir}`)
            return
        }
        
        // 读取日志文件列表
        const files = fs.readdirSync(logDir)
        const logFiles = files.filter(file => file.endsWith('.log'))
        
        if (logFiles.length === 0) {
            logger.debug('没有找到日志文件')
            return
        }
        
        logger.info(`找到 ${logFiles.length} 个日志文件，开始上传到 S3`)
        
        // 上传每个日志文件
        for (const file of logFiles) {
            const filePath = path.join(logDir, file)
            const fileContent = fs.readFileSync(filePath, 'utf8')
            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss')
            const prefix = s3Config.prefix || 'logs/streamerhelper'
            const key = `${prefix}/scheduled_${file}_${timestamp}.txt`
            
            try {
                await new Promise((resolve, reject) => {
                    s3Client.putObject({
                        Bucket: s3Config.bucket,
                        Key: key,
                        Body: fileContent,
                        ContentType: 'text/plain'
                    }, (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve(true)
                        }
                    })
                })
                
                logger.info(`成功上传日志文件到 S3: ${key}`)
            } catch (err) {
                logger.error(`上传日志文件到 S3 失败: ${file}, 错误: ${err}`)
            }
        }
        
        logger.info('S3定时推送任务完成')
    } catch (err) {
        logger.error(`S3定时推送任务执行异常: ${err}`)
    }
})

export default s3PushScheduler