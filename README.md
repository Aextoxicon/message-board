**介绍**
这是一个非常非常基本的留言板，也就是输入你的名称和内容然后让他们显示在网页上

其中`index.html`和`comment.js`以及

`style.css`是前端的东西，直接放入网站目录即可
然后就是`backend`里面的东西

- `server.js`是交给后端nodejs运行的

- `.env`是后端MongoDB连接字符串的node环境变量（process.env.MONGO）

**使用**
后端目录里面的东西全克隆到服务器里面你喜欢的目录，比如说`/opt/backend`

然后关于需要安装的依赖有nodejs以及MongoDB，剩下的npm包可以在后端目录直接`npm install`

关于MongoDB安装请查阅[MongoDB community edition在Linux上面的安装指南](https://www.mongodb.com/zh-cn/docs/manual/administration/install-on-linux/)