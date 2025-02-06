import { useState } from 'react'
import { Button } from '@kdcloudjs/kdesign'
import styles from './App.less'

const App = (props: any) => {
  console.log(styles)
  const [num, setNum] = useState<number>(0)
  return (
    <div className={styles.rect}>
      <h1>Hello 自定义控件</h1>
      <Button onClick={() => setNum((prev) => prev + 1)}>{num}</Button>
    </div>
  )
}

export default App
