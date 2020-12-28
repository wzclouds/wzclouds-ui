# wzclouds-ui

## 1.0 版本介绍
#### 主要用户会议管理系统后端通信及业务处理
***
## 环境准备

1. **node: v11.3.0/npm: v6.4.1**, 服务器需将**forever**组件也安装上
2. 安装**openssl**: `yum install openssl`
3. 生成或准备好自己的**SSL证书**, 用以配置nginx
4. 部署**turn服务器**用于信道建立,也可用别人的
```
yum install openssl openssl-libs libevent libevent-devel
git clone https://github.com/coturn/coturn.git
./configure
make & make install
turnserver -a -v --user ${username}:${password} -r=${外网ip} -X ${外网ip} -f --no-cli
```
## 启动项目 
```
npm install && node iceServer.js
```

## 流程图示例
```seq
clientA->clientB: p2p通道对等通信
clientB-->clientA: p2p通道对等通信
clientA->nodeServer: 客户端向通信服务器发出请求
clientB->nodeServer: 客户端向通信服务器发出请求
nodeServer-->clientA: 通信服务器向用户发出通知/广播
nodeServer-->clientB: 通信服务器向用户发出通知/广播
```
## turnServer配置示例
```
 listening-ip=172.17.229.167
 listening-port=3478
 tls-listening-port=5349
 external-ip=${外网ip}/${内网ip}
 lt-cred-mech
 realm=abc.org
 user=${用户}:${密码}
```
## nginx配置示例

```
 upstream web {
    server 192.168.1.124:8080;      
        }
 #代理websocket
 upstream websocket {
    server 192.168.1.124:3000;   
 }

server { 
    listen       443; 
    server_name  localhost;
	ssl          on;

    ssl_certificate     D://nginx-boke//nginx-1.9.12//conf//conf.d//ssl-cert-snakeoil.pem; #配置证书
    ssl_certificate_key  D://nginx-boke//nginx-1.9.12//conf//conf.d//ssl-cert-snakeoil.key; #配置密钥

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  50m;
	ssl_protocols TLSv1 TLSv1.1 TLSv1.2 SSLv2 SSLv3;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    #charset koi8-r;
    #access_log  logs/host.access.log  main;
    
  #wss 反向代理  
  location /wss {
     proxy_pass http://websocket/; # 代理到上面的地址去
     proxy_read_timeout 60s;
     proxy_set_header Host $host;
     proxy_set_header X-Real_IP $remote_addr;
     proxy_set_header X-Forwarded-for $remote_addr;
     proxy_set_header Upgrade $http_upgrade;
     proxy_set_header Connection 'Upgrade';	
  }

  #node 反向代理  
  location /nodeapi {
     proxy_pass http://192.168.1.124:3000; # 代理到上面的地址去	
  }

  location /zyhcq-out-meetings {
	 root E:\workspace\Fighter3.0\BigFront\cloud-meeting\dist;
	 index index.html;
  }

  location /zyhcq-out-statics {
    root E:\workspace\Fighter3.0\BigFront\cloud-meeting\dist;
    index index.html;
  }

  #https 反向代理
  location / {
     proxy_pass         http://web/;
     proxy_set_header   Host             $host;
     proxy_set_header   X-Real-IP        $remote_addr;
     proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
  }

  location /api {
     proxy_pass http://192.168.1.124:11001;
  }
}

```

## 部署脚本
```
PROJECT_NAME=$1

echo '1111'
if [ ! -n "$PROJECT_NAME" ] ;then
        echo "PROJECT 参数不能为空"
        exit 1
fi

rm -rf /data/projects/$PROJECT_NAME/*
tar -zxvf /data/projects/target_jar/$PROJECT_NAME.tgz -C /data/projects/target_jar/
tar -xvf /data/projects/target_jar/$PROJECT_NAME.tar -C /data/projects

cd /data/projects/$PROJECT_NAME

echo '---准备编译信令服务器---'

/data/nodejs/bin/npm install

echo '---准备启动信令服务器---'

echo '---停止旧进程---'
ps -ef | grep iceServer.js| grep -v grep | awk '{print $2}' | xargs kill -9

/data/nodejs/bin/node /data/nodejs/lib/node_modules/forever/bin/forever start iceServer.js

echo '启动守护进程'

echo '---信令服务器启动完毕---'

```

## 服务访问地址 https://192.168.1.124/wzclouds/meeting#/meetingvideo


## 2.0 版本介绍
#### 更新内容
1. 因为以前的前端在视频会议测试上很麻烦，需要https才能打开摄像头，现支持本地dev开发环境下使用https,要求ssl证书与后端一，node版本暂时需要10才可以。
2. 后端架构由node.js移植到java上，支持Fighter产品库相关内容(后续会移到5.0中)，以支持更多的生态技术，方便业务人员对项目进行功能迭代，也方便代码审查。
3. 新增NOTICE通用交互。
4. 整体系统结构及流程进行了修改，可以更灵活的操作房间与不同业务的流程。
5. 新增画板模块，新增系统设置模块。
6. 点对点即时聊天(待实现)。
7. 文件上传(已实现部分待对接)。
8. 处理一些bug。

## 1.0 业务流程
```flow
st=>start: 用户接入(第三方用户/临时用户)
op=>operation: 大厅
isJoin=>condition: 是否有房间号 Yes or No?
choose=>operation: 选择房间
meeting=>end: 进入房间并开始视频会议

st->isJoin->op->choose->meeting->meeting

isJoin(yes)->meeting
isJoin(no)->op
```


## 2.0 业务流程
```flow
st=>start: 用户接入(第三方用户/临时用户/系统用户)
op=>operation: 大厅
isJoin=>condition: 是否有房间号 Yes or No?
choose=>operation: 选择房间
meeting=>operation: 进入房间
meetingVideo=>operation: 开始视频会议/画板/系统设置等...业务

st->isJoin->op->choose->meeting->meetingVideo->

isJoin(yes)->meeting
isJoin(no)->op
```
