# kd-custom-control-cli
# 起步
#### 安装
```
npm install -g @kdcloudjs/kd-custom-control-cli
# OR
yarn global add @kdcloudjs/kd-custom-control-cli
```
#### 创建一个项目：
```
kd-custom-control-cli create my-project
```
注：这里的项目名称需要和自定义控件 **方案id** 保持一致
#### 模板选择：
提供四种开发模板供选择</br>

| 模板     | 版本     | 可选UI库     |
| -------- | -------- | -------- |
| React | ^16.13.0 | kdesign |
| Vue2  | ^2.7.11 | element-ui |
| Vue3  | ^3.4.29 | element-plus |
| jQuery| 3.5.0 | - |

#### 开发
```
cd my-project
yarn install
yarn start
```

#### 打包
```
yarn build
```

#### 本地调试
```
yarn server
```