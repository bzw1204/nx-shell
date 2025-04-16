import logger from 'electron-log'

logger.transports.file.format = '{y}-{m}-{d} {h}:{i}:{s} [{level}{scope}] {text}'
logger.transports.console.format = '[{level}{scope}]: {text}'
export default logger
