/**
 * 该文件用于开发环境实时预览效果，但无法和后端通信
 */

import ReactDOM from 'react-dom'
import App from '@/components/App'
import '@kdcloudjs/kdesign/dist/kdesign.css'

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement)
